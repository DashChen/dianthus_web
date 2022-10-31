import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { matExpansionAnimations } from '@angular/material/expansion';
import { LocalizationService } from '@cg/ng-localization';

@Component({
  selector: 'app-accordion-item',
  templateUrl: './accordion-item.component.html',
  styleUrls: ['./accordion-item.component.scss'],
  animations: [matExpansionAnimations.bodyExpansion,
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class AccordionItemComponent implements OnInit {

  @Input() hideToggle: boolean = true;
  @Input() index = 0;
  @Input() title  = '看診資料';
  @Input() info: string | null = '尚未帶入病患資料';
  @Input() btnContent  = this.translate.get('general.choose');
 
  @Output() isExpanded: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  isExpandedStatus = false;

  constructor(
    private translate: LocalizationService
  ) { }

  ngOnInit(): void {
  }

  sure(): void {
    this.isExpandedStatus = !this.isExpandedStatus;
    this.isExpanded.emit(this.isExpandedStatus);
  }

  changeStatus(): void {
    this.isExpandedStatus = false;
    this.isExpanded.emit(this.isExpandedStatus);
  }

}
