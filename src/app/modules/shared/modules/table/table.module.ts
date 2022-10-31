import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './components/table/table.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgLocalizationModule } from '@cg/ng-localization';
import { MaterialModule } from '@material//material.module';



@NgModule({
  declarations: [
    TableComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    NgLocalizationModule,
    FlexLayoutModule
  ],
  exports: [
    TableComponent
  ]
})
export class TableModule { }
