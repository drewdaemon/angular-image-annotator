import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingTextEntryComponent } from './floating-text-entry.component';

describe('FloatingTextEntryComponent', () => {
  let component: FloatingTextEntryComponent;
  let fixture: ComponentFixture<FloatingTextEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FloatingTextEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatingTextEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
