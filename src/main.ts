// Ensure Zone.js is loaded before bootstrapping. Although it is also included
// via polyfills, importing it here guards against misconfiguration during dev
// serves that could otherwise trigger runtime NG0908 errors and a blank screen.
import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [provideAnimations(), provideRouter(appRoutes)],
}).catch((err) => console.error(err));
