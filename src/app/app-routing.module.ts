import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AnnotateComponent} from './annotate/annotate.component';

const routes: Routes = [
  {path: '', component: AnnotateComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
