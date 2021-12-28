import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat';
import {firstValueFrom} from "rxjs";
import DocumentReference = firebase.firestore.DocumentReference;

export interface AnnotationCandidate {
  id: string;
  texts: string[];
  video: string;
  spokenLanguage: string;
  countryCode: string;
  lastHit?: any;
}

export interface CandidateSign {
  spoken: string;
  signed: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {

  constructor(private firestore: AngularFirestore) {
  }

  async updateSigns(ref: DocumentReference, signs: string[]) {
    return ref.update({
      signs,
      hits: -1,
      annotatedAt: new Date()
    });
  }

  async getOldestSign(): Promise<{ ref: DocumentReference, sign: CandidateSign }> {
    const signSnapshot = await firstValueFrom(this.firestore.collection('signbank', ref => ref
      .orderBy('lastHit', 'asc')
      .limit(1)).snapshotChanges());

    const sign = signSnapshot[0].payload.doc

    // Update hit date
    await sign.ref.update({lastHit: new Date()});

    return {
      ref: sign.ref,
      sign: sign.data() as CandidateSign,
    };
  }

  async getAnnotationCandidate(): Promise<{ ref: DocumentReference, data: AnnotationCandidate, signs: CandidateSign[] }> {
    const candidateSnapshot = await firstValueFrom(this.firestore.collection('candidates', ref => ref
      .where('spokenLanguage', '==', 'en')
      .where('countryCode', '==', 'us')
      .where('hits', '>=', 0)
      .orderBy('hits', 'asc')
      .orderBy('lastHit', 'asc')
      .limit(1)).snapshotChanges());

    const candidate = candidateSnapshot[0].payload.doc


    // Update hit date
    await candidate.ref.update({lastHit: new Date()});

    // Try to find a sign for those words
    const candidateData = candidate.data() as AnnotationCandidate;
    console.log(candidateData);

    const signs = await firstValueFrom(this.firestore.collection('signbank', ref =>
      ref.where('spoken', 'in', candidateData.texts.map(t => t.toLowerCase()))
        .where('spokenLanguage', '==', candidateData.spokenLanguage)
        .where('countryCode', '==', candidateData.countryCode)
    ).snapshotChanges());

    if (signs.length === 0) {
      await candidate.ref.update({hits: -1});

      return this.getAnnotationCandidate();
    }

    return {
      ref: candidate.ref,
      data: candidateData,
      signs: signs.map(s => s.payload.doc.data()) as CandidateSign[]
    };
  }

}
