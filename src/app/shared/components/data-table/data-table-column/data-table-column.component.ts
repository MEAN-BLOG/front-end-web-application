import { Component, Input, TemplateRef, ContentChild } from '@angular/core';

@Component({
  selector: 'app-data-table-column',
  templateUrl: './data-table-column.component.html',
})
export class DataTableColumnComponent {
  @Input() columnDef!: string;
  @Input() header: string = '';
  @Input() sortable: boolean = true;
  @Input() cellClass: string = '';

  @ContentChild('cellTemplate') templateRef!: TemplateRef<any>;

  get templateRefOrDefault(): TemplateRef<any> {
    return this.templateRef || this.defaultTemplate;
  }

  @ContentChild('defaultTemplate') defaultTemplate!: TemplateRef<any>;
}
