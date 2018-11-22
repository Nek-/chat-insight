import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';
import { Message } from '../../model/Message';
import { MessageComponent } from './message/message.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  entryComponents: [
    MessageComponent
  ]
})
export class ChatComponent implements OnInit {
  username: string;
  birthDate: string;
  form: FormGroup;
  @ViewChild('message', { read: ViewContainerRef }) container: ViewContainerRef;

  constructor(private route: ActivatedRoute, private wsService: WebsocketService,
              private router: Router, private resolver: ComponentFactoryResolver,
              private formBuilder: FormBuilder
              ) { }

  ngOnInit() {
    this.connect();
    this.form = this.formBuilder.group({
      message: ['', Validators.required]
    });
  }

  connect() {
    const ugly = this.route.snapshot.paramMap.get('userstr');
    const parts = ugly.split('/');
    if (parts.length !== 2) {
      this.router.navigate(['']);
      return;
    }

    this.username  = parts[0];
    this.birthDate = parts[1];
    this.wsService.connect(this.username, this.birthDate);
    this.wsService.message.subscribe((message: Message) => this.onMessage(message, false));
  }

  public submit() {
    if (this.form.invalid) {
      return;
    }

    const message = this.form.get('message').value;
    this.wsService.sendMessage(message);
    this.form.get('message').patchValue('');
    const now = new Date();
    const minutes = (now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()).toString();
    const hours = (now.getHours() < 10 ? '0' + now.getHours() : now.getHours()).toString();
    this.onMessage({
      content: message,
      nickname: 'Vous',
      hour: hours + ' h ' + minutes
    }, true);
  }

  /**
   * Insert message component
   * @param message the message
   * @param isMine if it is create locally of come from the server
   */
  private onMessage(message: Message, isMine: boolean) {
    const factory = this.resolver.resolveComponentFactory(MessageComponent);
    const componentRef = this.container.createComponent(factory);
    componentRef.instance.message = message;
    componentRef.instance.isMine = isMine;
  }
}
