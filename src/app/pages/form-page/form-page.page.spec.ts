import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormPagePage } from './form-page.page';

describe('FormPagePage', () => {
  let component: FormPagePage;
  let fixture: ComponentFixture<FormPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FormPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
