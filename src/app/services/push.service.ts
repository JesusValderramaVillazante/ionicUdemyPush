import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { not } from '@angular/compiler/src/output/output_ast';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  mensajes :OSNotificationPayload[] = [];
  pushListener = new EventEmitter<OSNotificationPayload>();
  userId: string;
  constructor(
    private oneSignal: OneSignal,
    private storage: Storage) {
      this.cargarMensajes();
  }

  async getMensajes(){
    await this.cargarMensajes();
    return [...this.mensajes];
  }
  
  configuracionInicial() {
    this.oneSignal.startInit('d172758a-cbdb-4946-9be8-20a4097c3b57', '573384992415');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe((noti) => {   
      this.notificacionRecibida(noti);
    });

    this.oneSignal.handleNotificationOpened().subscribe(async(noti) => {
      console.log(noti.notification);
      await this.notificacionRecibida( noti.notification );
    });

    this.oneSignal.getIds().then(info => {
      this.userId = info.userId;
    })

    this.oneSignal.endInit();
  }

  async notificacionRecibida(noti: OSNotification){
    await this.cargarMensajes();
    const payload = noti.payload;
    const existePush = this.mensajes.find((mensaje) => mensaje.notificationID === noti.payload.notificationID);
    if(existePush){
      return;
    }
    this.mensajes.unshift(payload);
    this.pushListener.emit(payload);
    
    await this.guardarMensajes();
  }

  guardarMensajes(){
    this.storage.set('mensajes', this.mensajes);
  }

  async cargarMensajes(){
    //this.storage.clear();
    this.mensajes = await this.storage.get('mensajes') || [];
    return this.mensajes;
  }

  async borrarMensajes(){
    await this.storage.clear;
    this.mensajes = [];
    this.guardarMensajes();
  }
}
