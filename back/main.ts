import * as WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { BiiGBackDev, devs } from './nicknames';

interface BiiGBackConnected {
  nickname: string;
  socket: WebSocket;
}

export interface Message {
  nickname: string;
  content: string;
  hour: string;
}

export class Server {
  private clients: BiiGBackConnected[] = [];
  private ws: WebSocket.Server;

  constructor() {
    const me = this;
    this.ws = new WebSocket.Server({
      host: '0.0.0.0',
      port: 8888,
      backlog: 30,
      verifyClient: function(info: any) {
        return true;
        return !!me.getDevFromRequest(info.req);
      },
    }, () =>  {
      console.log((new Date()) + ' Server is listening on port "8888"');
    });
    this.bindListeners();
  }


  private bindListeners() {
    this.ws.on('connection', (socket: WebSocket, request: IncomingMessage) => {
      console.log((new Date()) + ' Connection accepted.');
      const dev = this.getDevFromRequest(request);

      socket.send(Server.messageBuilder(`Bienvenue "${dev.nickname}" ;)`, 'BiiG Boss'));

      console.log(`"${dev.prenom}" --> "${dev.nickname}" vient de se connecter`);
      this.clients.push({
        nickname: dev.nickname,
        socket
      });

      socket.on('message', message => this.broadcastUserChatMessage(socket, <string>message));
      socket.on('close', (reasonCode: number, description: string) => {
        console.log((new Date()) + ' Disconnect. Code: ' + reasonCode + ' - Reason: ' + description);
      });
    });
  }

  public broadcastUserChatMessage(sender: WebSocket, message: string) {
    const userSender = this.clients.find((dev: BiiGBackConnected) => sender === dev.socket);
    if (!userSender) {
      console.warn('impossible de trouver le sender');
    }

    const messageToSend = Server.messageBuilder(message, userSender.nickname);
    this.ws.clients.forEach(function(client: any) {
      // TOut le monde sauf lui qui a écrit et ceux qui sont pret à recevoir des messages
      if (userSender.socket !== client && client.readyState === 1) {
        client.send(messageToSend);
      }
    });
  }

  getDevFromRequest(request: IncomingMessage):BiiGBackDev|null {
    const url = request.url.substr(1);
    const parts = url.split('&');
    console.log(url);
    if (parts.length !== 2) {
      return;
    }

    return devs.find((dev: BiiGBackDev) => {
      const name = parts[0];
      if (name === dev.prenom && dev.birthdate === parts[1]) {
        return true;
      }
      return false;
    });
  }

  private static messageBuilder(content: string, sender: string): string {
    const now = new Date();
    const minutes = (now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()).toString();
    const hours = (now.getHours() < 10 ? '0' + now.getHours() : now.getHours()).toString();
    return JSON.stringify({
      content: content,
      nickname: sender,
      hour: hours + ' h ' + minutes
    });
  }
}

const server = new Server();
