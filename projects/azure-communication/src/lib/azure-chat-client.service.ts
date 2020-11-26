import { Dictionary, IDictionary } from './Dictionary';
import { AzureConfiguration } from './azure-configuration';
import { Injectable, OnInit } from '@angular/core';
import { ChatClient, ChatMessage, ChatThread, ChatThreadClient } from '@azure/communication-chat';
import { AzureCommunicationUserCredential } from '@azure/communication-common';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AzureChatClient {

  public threads: BehaviorSubject<ChatThread[]>;

  private chatClient: ChatClient;
  private chatThreadClients: IDictionary<ChatThread, ChatThreadClient>;
  private messageSubjects: IDictionary<ChatThreadClient, BehaviorSubject<ChatMessage[]>>;


  constructor(
    private azureConfig: AzureConfiguration
  ) {
    this.threads = new BehaviorSubject<ChatThread[]>([]);
    this.chatThreadClients = new Dictionary<ChatThread, ChatThreadClient>(
      (a, b) => !!a.id && !!b.id ? a.id.localeCompare(b.id) : -1
    );
    this.messageSubjects = new Dictionary<ChatThreadClient, BehaviorSubject<ChatMessage[]>>(
      (a, b) => a.threadId.localeCompare(b.threadId)
    );

    this.chatClient = new ChatClient(
      this.azureConfig.endpointUrl,
      new AzureCommunicationUserCredential(this.azureConfig.tokenFn())
    );

    this.chatClient.startRealtimeNotifications()
      .then(_ => console.log('Chat client initialized and realtime notificaitons started'));

    this.setupEventHandlers();
  }

  public async getMessages(chatThread: ChatThread): Promise<Observable<ChatMessage[]>> {
    if (this.chatThreadClients.containsKey(chatThread)) {
      const chatThreadClient =  this.chatThreadClients.getValue(chatThread);

      if (this.messageSubjects.containsKey(chatThreadClient)) {
        const messageSubject = this.messageSubjects.getValue(chatThreadClient);
        return messageSubject.asObservable();
      }
      else {
        const messages = await this.getChatMessages(chatThreadClient);
        const messageSubject = new BehaviorSubject<ChatMessage[]>(messages);
        this.messageSubjects.add(chatThreadClient, messageSubject);
        return messageSubject.asObservable();
      }
    }
    else {
      const chatThreadClient = await this.getChatThreadClient(chatThread);
      this.chatThreadClients.add(chatThread, chatThreadClient);
      const messages = await this.getChatMessages(chatThreadClient);
      const messageSubject = new BehaviorSubject<ChatMessage[]>(messages);
      this.messageSubjects.add(chatThreadClient, messageSubject);
      return messageSubject.asObservable();
    }
  }

  private setupEventHandlers(): void {
    this.chatClient.on('chatMessageReceived', async (e) => {
      await this.onChatThreadsChanged();
      await this.onChatMessagesChanged();
    });
  }

  private async onChatMessagesChanged(): Promise<void> {
    const loadedChatThreadClients = this.chatThreadClients.values();

    for (const chatThreadClient of loadedChatThreadClients) {
      if (!!chatThreadClient && this.messageSubjects.containsKey(chatThreadClient)){
        const messages = await this.getChatMessages(chatThreadClient);
        this.messageSubjects.getValue(chatThreadClient).next(messages);
      }
    }
  }

  private async onChatThreadsChanged(): Promise<void> {
    const threads = [];

    for await (const currChatThreads of this.chatClient.listChatThreads().byPage()) {
      threads.push(...currChatThreads);
    }
    this.threads.next(threads);
  }

  private async getChatThreadClient(chatThread: ChatThread): Promise<ChatThreadClient> {
    if (!!chatThread && !!chatThread.id) {
      return await this.chatClient.getChatThreadClient(chatThread.id);
    }
    else {
      throw new Error('Provided ChatThread object is null or has no id.')
    }
  }

  private async getChatMessages(chatThreadClient: ChatThreadClient): Promise<ChatMessage[]> {
    const messages = [];

    for await (const currMessages of chatThreadClient.listMessages().byPage()){
      messages.push(...currMessages);
    }

    return messages.sort((m1, m2) => !!m1.createdOn && !!m2.createdOn ?
        m1.createdOn.getTime() - m2.createdOn.getTime() :
        -1);
  }





}
