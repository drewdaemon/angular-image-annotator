import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AiaImageAnnotatorComponent } from './aia-image-annotator.component';

describe('AiaImageAnnotatorComponent', () => {
  let component: AiaImageAnnotatorComponent;
  let fixture: ComponentFixture<AiaImageAnnotatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AiaImageAnnotatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AiaImageAnnotatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
