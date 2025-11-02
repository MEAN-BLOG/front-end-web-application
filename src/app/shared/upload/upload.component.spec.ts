import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadComponent } from './upload.component';
import { UploadService } from './upload.service';

/**
 * Unit tests for UploadComponent.
 *
 * @description
 * This suite validates the upload flow behaviour of the UploadComponent:
 * - calls UploadService correctly
 * - emits download URL after successful upload
 * - ignores non image files
 * - manages loading state flags correctly
 *
 * The UploadService is mocked (spy object) because the component is only
 * responsible for triggering upload + reacting to result — not Firebase I/O.
 */
describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;
  let uploadServiceSpy: jasmine.SpyObj<UploadService>;

  beforeEach(async () => {
    uploadServiceSpy = jasmine.createSpyObj('UploadService', ['uploadImage']);

    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        { provide: UploadService, useValue: uploadServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /** Component should initialize successfully */
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  /**
   * When uploading a valid image file:
   * - uploadImage() must be called
   * - component must emit final URL
   */
  it('should emit URL after upload', async () => {
    const fakeUrl = 'https://test.com/image.jpg';
    uploadServiceSpy.uploadImage.and.resolveTo(fakeUrl);

    spyOn(component.fileUploaded, 'emit');

    const fakeFile = new File(['abc'], 'test.jpg', { type: 'image/jpeg' });

    await component.handleFileInput(fakeFile);

    expect(uploadServiceSpy.uploadImage).toHaveBeenCalledWith(fakeFile);
    expect(component.fileUploaded.emit).toHaveBeenCalledWith(fakeUrl);
  });

  /**
   * Non image file types should not be passed to UploadService
   */
  it('should ignore non-image file', async () => {
    const fakeFile = new File(['abc'], 'test.pdf', { type: 'application/pdf' });

    await component.handleFileInput(fakeFile);

    expect(uploadServiceSpy.uploadImage).not.toHaveBeenCalled();
  });

  /**
   * Loading flag must be toggled true during upload and false afterwards
   */
  it('should set loading while uploading', async () => {
    const fakeUrl = 'https://test.com/img.png';
    uploadServiceSpy.uploadImage.and.resolveTo(fakeUrl);

    const fakeFile = new File(['abc'], 'x.png', { type: 'image/png' });
    expect(component.loading).toBeFalse();

    const promise = component.handleFileInput(fakeFile);

    expect(component.loading).toBeTrue();

    await promise;

    expect(component.loading).toBeFalse();
  });
});
