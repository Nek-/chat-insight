import { EventEmitter, Injectable, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Message } from '../model/Message';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private _socketConnection: WebSocket;
  @Output() message: EventEmitter<Message> = new EventEmitter<Message>();

  constructor(private router: Router) {}

  connect(name: string, birthdate: string) {
    const parts = birthdate.split('-');
    if (+parts[1] < 10) {
      birthdate = parts[0] + '-0' + parts[1];
    }
    this._socketConnection = new WebSocket('ws://localhost:8888/' + name + '&' + birthdate);

    // Listen for messages
    this._socketConnection.addEventListener('message', (event: MessageEvent) => {
      console.log('Message from server ', event.data);
      this.message.emit(JSON.parse(event.data));
    });

    this._socketConnection.addEventListener('error', (event) => {
      this.router.navigate(['']);
    });
  }

  sendMessage(message: string) {
    if (!this.socketConnection) {
      console.warn('Not CONNECTED :/');
      return;
    }

    this.socketConnection.send(message);
  }

  get socketConnection(): WebSocket {
    return this._socketConnection;
  }
}
