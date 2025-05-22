// app-routing.module.ts
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () => import('./authentication/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'register',
    loadChildren: () => import('./authentication/register/register.module').then((m) => m.RegisterPageModule),
  },
  {
    path: 'cars',
    loadChildren: () => import('./car/cars/cars.module').then((m) => m.CarsPageModule),
  },
  {
    path: 'car-add',
    loadChildren: () => import('./car/car-add/car-add.module').then((m) => m.CarAddPageModule),
  },
  {
    path: 'car-details/:id',
    loadChildren: () => import('./car/car-details/car-details.module').then((m) => m.CarDetailsPageModule),
  },
  {
    path: 'car-edit/:id',
    loadChildren: () => import('./car/car-edit/car-edit.module').then((m) => m.CarEditPageModule),
  },
  {
    path: 'refueling',
    loadChildren: () => import('./expenses/refueling/refueling.module').then((m) => m.RefuelingPageModule),
  },
  {
    path: 'toll-tax',
    loadChildren: () => import('./expenses/toll-tax/toll-tax.module').then((m) => m.TollTaxPageModule),
  },
  {
    path: 'annual-tax',
    loadChildren: () => import('./expenses/annual-tax/annual-tax.module').then((m) => m.AnnualTaxPageModule),
  },
  {
    path: 'maintaining',
    loadChildren: () => import('./expenses/maintaining/maintaining.module').then((m) => m.MaintainingPageModule),
  },
  {
    path: 'vehicle-insurance',
    loadChildren: () => import('./expenses/vehicle-insurance/vehicle-insurance.module').then((m) => m.VehicleInsurancePageModule),
  },
  {
    path: 'mechanical-bills',
    loadChildren: () => import('./expenses/mechanical-bills/mechanical-bills.module').then((m) => m.MechanicalBillsPageModule),
  },
  {
    path: 'yearly-vehicle-check',
    loadChildren: () => import('./expenses/yearly-vehicle-check/yearly-vehicle-check.module').then((m) => m.YearlyVehicleCheckPageModule),
  },
  {
    path: 'another-expenses',
    loadChildren: () => import('./expenses/another-expenses/another-expenses.module').then((m) => m.AnotherExpensesPageModule),
  },
  {
    path: 'monthly-expenses',
    loadChildren: () => import('./expenses/monthly-expenses/monthly-expenses.module').then((m) => m.MonthlyExpensesPageModule),
  },
  {
    path: 'car-listing',
    loadChildren: () => import('./market/car-listing/car-listing.module').then((m) => m.CarListingPageModule),
  },
  { 
    path: 'car-market',
    loadChildren: () => import('./market/car-market/car-market.module').then((m) => m.CarMarketPageModule),
  },
  { 
    path: 'car-offer-details/:id',
    loadChildren: () => import('./market/car-offer-details/car-offer-details.module').then((m) => m.CarOfferDetailsPageModule),
  },
  { 
    path: 'chat/:id',
    loadChildren: () => import('./chats/chat/chat.module').then((m) => m.ChatPageModule),
  },
  { 
    path: 'chat-list',
    loadChildren: () => import('./chats/chat-list/chat-list.module').then((m) => m.ChatListPageModule),
  },
  {
    path: 'blog-list',
    loadChildren: () => import('./blog/blog-list/blog-list.module').then(m => m.BlogListPageModule),
  },
  {
    path: 'blog-details/:id',
    loadChildren: () => import('./blog/blog-details/blog-details.module').then(m => m.BlogDetailsPageModule),
  },
  {
    path: 'blog-add',
    loadChildren: () => import('./blog/blog-add/blog-add.module').then(m => m.BlogAddPageModule),
  },
  {
    path: 'user-settings',
    loadChildren: () => import('./user-settings/user-settings.module').then( m => m.UserSettingsPageModule)
  },
  {
    path: 'diagnostic',
    loadChildren: () => import('./diagnostic/diagnostic.module').then( m => m.DiagnosticPageModule)
  },
  {
    path: 'ai-chat',
    loadChildren: () => import('./chats/ai-chat/ai-chat.module').then( m => m.AiChatPageModule)
  },


];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
