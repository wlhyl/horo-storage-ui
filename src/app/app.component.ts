import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from './services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
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
  active = ResourcePath.Native;

  readonly path = {
    Home: `${Path.Resource}/${ResourcePath.Home}`,
    Native: `${Path.Resource}/${ResourcePath.Native}`,
    User: `${Path.Resource}/${ResourcePath.User}`,
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public user: AuthService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.title);

    // 因为home组件对应的path是'',因此this.route.snapshot.url是空数组
    // 即使访问/user，this.route.snapshot.url也是空数组，
    // 因为ActivatedRoute是当前激活的路由，此组件对应的路由是""，非当前激活路由
    // 访问/user，user组件中的ActivatedRoute可以获取到 "user"这个path
    const currentPath = this.router.url.split('/').pop();

    if (currentPath === ResourcePath.Home) {
      this.active = ResourcePath.Home;
    } else if (currentPath === ResourcePath.User) {
      this.active = ResourcePath.User;
    } else if (currentPath === ResourcePath.Native) {
      // 这段赋值可以不用写，增加这个分支判断是为了去掉多余的路由跳转
      this.active = ResourcePath.Native;
    } else {
      this.router.navigate([ResourcePath.Native], { relativeTo: this.route });
    }
  }

  login() {
    this.router.navigateByUrl(`${Path.Login}`);
  }

  logout() {
    this.user.deleteToken();
  }
}
