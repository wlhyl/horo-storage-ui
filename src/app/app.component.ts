import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from './services/auth/auth.service';
import { Router } from '@angular/router';
import { Path } from './enum/path';
import { Path as ResourcePath } from './resources/enum/path';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: false,
})
export class AppComponent implements OnInit {
  title = 'horo_storage';

  readonly path = {
    Home: `${Path.Resource}/${ResourcePath.Home}`,
    Native: `${Path.Resource}/${ResourcePath.Native}`,
    User: `${Path.Resource}/${ResourcePath.User}`,
  };

  constructor(
    private router: Router,
    public user: AuthService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
  }

  login() {
    this.router.navigateByUrl(`${Path.Login}`);
  }

  logout() {
    this.user.deleteToken();
    this.router.navigateByUrl(`${Path.Login}`);
  }
}
