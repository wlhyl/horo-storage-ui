import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Path } from './enum/path';
import { NativesComponent } from './natives/natives.component';
import { UserComponent } from './user/user.component';
import { HomeComponent } from './home/home.component';
import { HistoricalComponent } from './historical/historical.component';
import { PersonsComponent } from './persons/persons.component';
import { TagsComponent } from './tags/tags.component';
import { DiceComponent } from './dice/dice.component';

const routes: Routes = [
  { path: Path.Home, component: HomeComponent },
  { path: Path.Native, component: NativesComponent },
  { path: Path.User, component: UserComponent },
  { path: Path.Historical, component: HistoricalComponent },
  { path: Path.Person, component: PersonsComponent },
  { path: Path.Tag, component: TagsComponent },
  { path: Path.Dice, component: DiceComponent },
  { path: '**', redirectTo: Path.Home },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResourcesRoutingModule {}
