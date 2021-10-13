import {Component, ElementRef, OnInit} from '@angular/core';
import {AnnotationService, CandidateSign} from '../services/annotation/annotation.service';
import firebase from 'firebase/compat';
import {AngularFireStorage} from '@angular/fire/compat/storage';
import DocumentReference = firebase.firestore.DocumentReference;

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})
export class CameraComponent implements OnInit {
  loading = true;

  signRef!: DocumentReference;
  sign!: CandidateSign;

  stream!: MediaStream;
  video: string | null = null;
  blob!: Blob;

  timer = 0;

  constructor(private annotationService: AnnotationService, private elementRef: ElementRef, private storage: AngularFireStorage) {
  }

  ngOnInit(): void {
    this.newSign();
  }

  async newSign() {
    this.video = null;
    this.loading = true;

    const c = await this.annotationService.getOldestSign();
    this.signRef = c.ref;
    this.sign = c.sign;

    this.loading = false;
  }

  skip() {
    return this.newSign();
  }

  get videoEl() {
    return this.elementRef.nativeElement.querySelector('video');
  }

  async record() {
    this.video = null;
    this.stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});

    this.videoEl.srcObject = this.stream;

    this.timer = 3;


    // set MIME type of recording as video/webm
    // @ts-ignore
    const recorder = new MediaRecorder(this.stream, {mimeType: 'video/webm'});
    const blobs: BlobPart[] = [];

    // event : new recorded video blob available
    recorder.addEventListener('dataavailable', (e: any) => blobs.push(e.data));
    recorder.addEventListener('stop', (e: any) => {
      // create local object URL from the recorded video blobs
      this.blob = new Blob(blobs, {type: 'video/webm'})
      this.video = URL.createObjectURL(this.blob);

      this.videoEl.srcObject = null;
      this.videoEl.src = this.video;
    });

    // Set timer
    setTimeout(() => this.timer = 3, 0)
    setTimeout(() => this.timer = 2, 1000)
    setTimeout(() => this.timer = 1, 2000)
    setTimeout(() => {
      this.timer = 0;
      recorder.start(1000);
      setTimeout(() => recorder.stop(), 5000);
    }, 3000)

  }

  async upload() {
    this.loading = true;

    const filePath = `uploads/${this.signRef.id}_${Date.now()}.webm`;
    const storageRef = this.storage.ref(filePath);
    await storageRef.put(this.blob, {
      contentType: 'video/webm',
      customMetadata: {spoken: this.sign.spoken, signed: this.sign.signed}
    })

    return this.newSign();
  }
}
