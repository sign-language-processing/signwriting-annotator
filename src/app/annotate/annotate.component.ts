import {Component, OnInit} from '@angular/core';
import {AnnotationCandidate, AnnotationService, CandidateSign} from '../services/annotation/annotation.service';
import firebase from 'firebase/compat';
import {MatSelectionListChange} from '@angular/material/list';
import DocumentReference = firebase.firestore.DocumentReference;

@Component({
  selector: 'app-annotate',
  templateUrl: './annotate.component.html',
  styleUrls: ['./annotate.component.scss']
})
export class AnnotateComponent implements OnInit {

  loading = true;

  candidateRef!: DocumentReference;
  candidate!: AnnotationCandidate;
  signs!: CandidateSign[];

  selectedSigns: string[] = [];

  constructor(private annotationService: AnnotationService) {
  }

  ngOnInit(): void {
    this.newCandidate();
  }

  async newCandidate() {
    this.loading = true;
    this.selectedSigns = [];

    const c = await this.annotationService.getAnnotationCandidate();
    this.candidateRef = c.ref;
    this.candidate = c.data;
    this.signs = c.signs;

    this.loading = false;
  }

  selectSigns(event: MatSelectionListChange) {
    this.selectedSigns = event.source.options.filter(o => o.selected).map(o => o.value);
  }
}
