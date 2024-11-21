import { IMAGE_CONFIG } from '@angular/common';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true,
      },
    },
  ],
};
