import { Component, Inject, Injector, Input, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { DateTime } from 'luxon';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ComponentLoaderOptions, SharedService, UserAuthService, } from '@libs/shared';
import { Store } from '@ngrx/store';
import { deleteDelegations, getDelegations, getUsername, saveDelegations, } from 'projects/libs/state-management/src/lib/state/authority-delegations/authority-delegations.action';
import { selectDelegationsInfo, selectUserFilter, } from 'projects/libs/state-management/src/lib/state/authority-delegations/authority-delegations.selector';
import { selectAllLoginAttempts } from 'projects/libs/state-management/src/lib/state/login-attempts/login-attempts.selector';
import { getLoginAttempts } from 'projects/libs/state-management/src/lib/state/login-attempts/login-attempts.actions';
import {
  deleteAccount, getMLATenancyData, getNotificationSettings, getUserNotification, linkToUser, SetAllNotificationsAsRead,
  SetNotificationRead, updateNotificationSettings,
} from 'projects/libs/state-management/src/lib/state/mla/mla.actions';
import { selectAllNotification, selectNotificationSettings, selectTenancyData, } from 'projects/libs/state-management/src/lib/state/mla/mla.selector';
import { AlertService } from 'projects/libs/shared/src/lib/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { ThemesService } from 'projects/libs/themes/src/public-api';
import { PrepareCollectedData } from 'projects/libs/state-management/src/lib/state/DownloadData/download-data.action';
import { DOCUMENT } from '@angular/common';
import { slideInAnimation } from '../animation';
import { RouterOutlet } from '@angular/router';
import { getProfilepic } from 'projects/libs/state-management/src/lib/state/profile-settings/profile-settings.actions';
import { selectAllVisualsettings } from 'projects/libs/state-management/src/lib/state/Visual-settings/visual-settings.selector';
import { getVisualsettings } from 'projects/libs/state-management/src/lib/state/Visual-settings/visual-settings.actions';
import { getLanguages, setDefaultLanguageForUI } from 'projects/libs/state-management/src/lib/state/language/language.actions';
import { changePassword, getProfile } from 'projects/libs/state-management/src/lib/state/mysettings/mysettings.action';
import { selectAllLanguages, selectDefaultLanguage } from 'projects/libs/state-management/src/lib/state/language/language.selector';
import { selectProfileInfo } from 'projects/libs/state-management/src/lib/state/mysettings/mysettings.selector';

declare var bootstrap: any;
@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  animations: [slideInAnimation],
})
export class SidenavComponent {
  showDelegationButtonSpinner: boolean;
  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation
    );
  }
  index: any = '12';
  FixedHeaderBody: boolean = true;
  toggleSideNav: boolean = false;
  currentAlerts: any = [];
  selectedLanguage: any = { language: '', icon: '' };
  severity = ['info', 'error', 'success', 'warn', 'fatal'];
  LoginAttempts: any = {
    TableHeader: [
      {
        displayName: 'IP Address',
        key: 'clientIpAddress',
        dataType: 'text',
        dataLength: 30,
        required: true,
      },
      {
        displayName: 'Browser',
        key: 'browserInfo',
        dataType: 'text',
        dataLength: 30,
        required: true,
      },
      {
        displayName: 'Date&Time',
        key: 'creationTime',
        dataType: 'text',
        dataLength: 30,
        required: true,
      },
      {
        displayName: 'Result',
        key: 'result',
        dataType: 'text',
        dataLength: 30,
        required: true,
      },
    ],
    LoginDatatable: [],
  };
  profileData: any;
  rdsDeligateTableData: any = [];
  usernameList: any = [];
  sideMenuCollapsed: boolean = false;
  headerHeight: any = '110px';
  @Input() AccountLinkedTable: any = [];
  receiveNotifications: any;
  notificationTypes: any = [];
  sidenavItemsOriginal: any = [
    {
      label: 'Dashboard',
      labelTranslationKey: 'Dashboard',
      id: '',
      permissionName: 'Pages.Administration.Host.Dashboard',
      icon: 'home',
      path: '/pages/dashboard',
      descriptionTranslationKey: 'Statistics and reports',
      description: 'Statistics and reports',
    },
    {
      label: 'Dashboard',
      labelTranslationKey: 'Dashboard',
      id: '',
      permissionName: 'Pages.Tenant.Dashboard',
      icon: 'home',
      path: '/pages/dashboard',
      description: 'Statistics and reports',
      descriptionTranslationKey: 'Statistics and reports',
    },
    {
      label: 'UI Components',
      labelTranslationKey: 'UI Components',
      id: '',
      permissionName: '',
      icon: 'demo_ui',
      path: '/pages/demo-ui',
      description: '',
      descriptionTranslationKey: '',
    },
    {
      label: 'Icons',
      labelTranslationKey: 'Icons',
      id: '',
      permissionName: '',
      icon: 'icons',
      path: '/pages/icons',
      description: 'icons',
      descriptionTranslationKey: '',
    },
    {
      label: 'Pages',
      labelTranslationKey: 'Pages',
      id: '',
      permissionName: '',
      icon: 'pages',
      path: 'pages',
      children: [
        {
          label: 'Tenants',
          labelTranslationKey: 'Tenants',
          id: 'tenants',
          permissionName: 'Pages.Tenants',
          icon: 'tenant',
          path: '/pages/tenant',
          description: 'Manage your tenants',
          descriptionTranslationKey: 'Manage your tenants',
        },
        {
          label: 'Editions',
          labelTranslationKey: 'Editions',
          id: '',
          permissionName: 'Pages.Editions',
          icon: 'editions',
          path: '/pages/edition',
          description: 'Manage editions and features of the application',
          descriptionTranslationKey:
            'Manage editions and features of the application',
        },
        {
          label: 'Administration',
          labelTranslationKey: 'Administration',
          id: 'admin',
          permissionName: '',
          icon: '',
          path: '',
          children: [
            {
              label: 'Organization Units',
              labelTranslationKey: 'Organization Units',
              id: '',
              permissionName: 'Pages.Administration.OrganizationUnits',
              icon: 'organization',
              path: '/pages/organization-unit',
              description: 'Use organization units to organize users and entities',
              descriptionTranslationKey:
                'Use organization units to organize users and entities',
            },
            {
              label: 'Roles',
              labelTranslationKey: 'Roles',
              id: '',
              permissionName: 'Pages.Administration.Roles',
              icon: 'roles',
              path: '/pages/role',
              description: 'Use roles to group permissions',
              descriptionTranslationKey: 'Use roles to group permissions',
            },
            {
              label: 'Users',
              labelTranslationKey: 'Users',
              id: '',
              permissionName: 'Pages.Administration.Users',
              icon: 'users',
              path: '/pages/user',
              description: 'Manage users and permissions',
              descriptionTranslationKey: 'Manage users and permissions',
            },
            {
              label: 'Language',
              labelTranslationKey: 'Language',
              id: '',
              permissionName: 'Pages.Administration.Languages',
              icon: 'languages',
              path: '/pages/language',
              description: 'Manage user interface languages',
              descriptionTranslationKey: 'Statistics and reports',
            },
            {
              label: 'Audit logs',
              labelTranslationKey: 'Audit logs',
              id: '',
              permissionName: 'Pages.Administration.AuditLogs',
              icon: 'audit_logs',
              path: '/pages/audit-logs',
              descriptionTranslationKey: '',
            },
            {
              label: 'subscription',
              labelTranslationKey: 'subscription',
              id: '',
              permissionName: 'Pages.Administration.Tenant.SubscriptionManagement',
              icon: 'subscription',
              path: '/pages/subscription',
              descriptionTranslationKey: '',
            },
            // {
            //   label: 'Maintenance',
            //   labelTranslationKey: 'Maintenance',
            //   id: '',
            //   permissionName: 'Pages.Administration.Host.Maintenance',
            //   icon: 'maintenance',
            //   path: '/pages/maintenance',
            //   description: 'Statistics and reports',
            //   descriptionTranslationKey: 'Statistics and reports',
            // },
            {
              label: 'Maintenance',
              labelTranslationKey: 'Maintenance',
              id: '',
              permissionName: '',
              icon: 'maintenance',
              path: '/pages/maintenance',
              description: 'Statistics and reports',
              descriptionTranslationKey: 'Statistics and reports',
            },
            {
              label: 'Visual Settings',
              labelTranslationKey: 'Visual Settings',
              id: '',
              permissionName: '',
              icon: 'visual_settings',
              path: '/pages/visualsettings',
              description: 'Change the look of UI',
              descriptionTranslationKey: 'Change the look of UI',
            },
            {
              label: 'Webhook Subscriptions',
              labelTranslationKey: 'Webhook Subscriptions',
              id: '',
              permissionName: 'Pages.Administration.WebhookSubscription',
              icon: 'webhook_subscription',
              path: '/pages/webhooksubscription',
              description: 'Webhook Subsubscription Info',
              descriptionTranslationKey: 'Statistics and reports',
            },
            {
              label: 'Dynamic Properties',
              labelTranslationKey: 'Dynamic Properties',
              id: 'Pages.Administration.DynamicProperties',
              permissionName: '',
              icon: 'dynamic_properties',
              path: '/pages/dynamic-property-management',
              descriptionTranslationKey: '',
            },
            {
              label: 'Settings',
              labelTranslationKey: 'Settings',
              id: '',
              permissionName: 'Pages.Administration.Host.Settings',
              icon: 'setting',
              path: '/pages/settings',
              description: 'Show and change application settings',
              descriptionTranslationKey: 'Show and change application settings',
            },
            {
              label: 'Settings',
              labelTranslationKey: 'Settings',
              id: '',
              permissionName: 'Pages.Administration.Tenant.Settings',
              icon: 'setting',
              path: '/pages/settings',
              description: 'Show and change application settings',
              descriptionTranslationKey: 'Show and change application settings',
            },
          ],
        }
      ],
    }
    //,
    //{
    //  label: 'Apps',
    //  labelTranslationKey: 'Apps',
    //  id: '',
    //  permissionName: '',
    //  icon: 'apps',
    //  path: '',
    //  children: [
    //    {
    //      label: 'Settings',
    //      labelTranslationKey: 'Settings',
    //      id: '',
    //      permissionName: 'Pages.Administration.Tenant.Settings',
    //      icon: 'setting',
    //      path: '/pages/settings',
    //      description: 'Show and change application settings',
    //      descriptionTranslationKey: 'Show and change application settings',
    //    },
    //  ]
    //}

    // { label: 'Api Scopes', id: 'ApiScope', permissionName: '', icon: 'settings', path: '/pages/apiScope', description: 'Home > Identity Server > Api Scope' },

    // { label: 'Cart', labelTranslationKey: 'Cart', id: 'cart', permissionName: '' ,icon: 'tenant', path: '/pages/cart', description: 'Manage your cart', descriptionTranslationKey: 'Manage your cart' },
    // { label: 'Edition-New', labelTranslationKey: 'Edition-New', id: '', permissionName: '', icon: 'home', path: '/pages/editionnew', description: '', descriptionTranslationKey: '' },
  ];

  logo: string =
    'https://www.carlogos.org/logo/Volkswagen-logo-2019-640x500.jpg';
  logoWithName: string =
    'https://www.sydneydieselcentre.com.au/wp-content/uploads/2015/10/volkswagen-cars-logo-300x275.jpg';
  color: string = '#8d9ba9';
  backgroundColor: string = '#F5F5FA';
  collapsedHeaderHeight: any = '40px';
  profilePic: string = '../assets/profile-picture.png';
  offCanvasId: string = 'profileOffCanvas';
  collapseRequired: any = true;
  tenancy: string = 'Host Admin';
  selectedMenu: string = '';
  selectedMenuDescription: string = '';
  sub: Subscription;
  accountPage = true;
  activePage: any;
  activesubmenu: any;
  languageItems: any = [];
  linkedAccountData: any = [];
  linkedAccountHeaders: any = [
    {
      displayName: 'User Name',
      key: 'username',
      dataType: 'text',
      dataLength: 30,
      required: true,
    },
  ];
  notifications: any[];
  unreadCount: number = 0;
  selectedMode: any;
  counter: number = 0;
  isLightMode: boolean = true;
  fixedHeader: boolean = true;
  tenancyTableData = [];
  sidenavItems = [];
  permissions: any;

  constructor(
    private router: Router,
    private store: Store,
    private alertService: AlertService,
    public translate: TranslateService,
    private shared: SharedService,
    private userAuthService: UserAuthService,
    private theme: ThemesService,
    @Inject(DOCUMENT) private document: Document
  ) {

    this.index = localStorage.getItem('themeIndex');
    if (this.index == null) {
      this.index = '12'
    }
  }


  ngAfterViewInit() {

  }


  ngOnInit(): void {
    this.store.dispatch(getVisualsettings());
    let selectedTheme = localStorage.getItem('THEME');
    this.setTheme(selectedTheme);
    this.userAuthService.index$.subscribe((value) => {
      this.index = value;
      // this.selectAllvisualSettings();
    });
    this.alertService.themes.subscribe((theme) => {
      if (theme) {
        this.setTheme(theme);
      }

    })

    // this.selectAllvisualSettings()

    const tenancy: any = JSON.parse(localStorage.getItem('tenantInfo'));
    if (tenancy) {
      this.tenancy = tenancy.name;
    } else {
      this.tenancy = 'Host Admin';
    }
    this.store.dispatch(getLanguages());
    this.store.select(selectDefaultLanguage).subscribe((res: any) => {
      if (res) {
        this.translate.use(res);
        let htmlTag = this.document.getElementsByTagName(
          'html'
        )[0] as HTMLHtmlElement;
        if (htmlTag) {
          htmlTag.dir = res === 'ar' ? 'rtl' : 'ltr';
        }
        this.sidenavItems = this.translateMenu(this.sidenavItems);
      }
    });

    this.userAuthService.getPermissions().subscribe((res) => {
      if (res) {
        this.filterNavItems(this.sidenavItemsOriginal, res, this.sidenavItems);
      } else {
        const storedPermission = localStorage.getItem('storedPermissions');
        const parsedPermission = JSON.parse(storedPermission);
        if (parsedPermission) {
          this.permissions = parsedPermission;
          this.filterNavItems(
            this.sidenavItemsOriginal,
            parsedPermission,
            this.sidenavItems
          );
        }
      }
    });
    this.subscribeToAlerts();

    this.store.dispatch(getNotificationSettings());
    this.store.select(selectNotificationSettings).subscribe((res: any) => {
      if (res && res !== null) {
        this.receiveNotifications = res.receiveNotifications;
        this.notificationTypes = [];
        res.notifications.forEach((notification: any) => {
          const data: any = {
            name: notification.name,
            displayName: notification.displayName,
            isSubscribed: notification.isSubscribed,
          };
          this.notificationTypes.push(data);
        });
      }
    });
    this.store.dispatch(getUserNotification());

    this.store.select(selectAllNotification).subscribe((res: any) => {
      if (res && res.items && res.items.length) {
        this.unreadCount = res.unreadCount;
        this.notifications = [];
        res.items.forEach((element: any) => {
          this.notifications.push(this.format(element));
        });
        this.notifications.sort(function (a, b) {
          return a.state - b.state;
        });
      }
    });

    this.store.select(selectAllLanguages).subscribe((res: any) => {
      if (res && res.items && res.items.length > 0) {
        this.languageItems = [];
        const languages: any = [];
        res.items.forEach((item: any) => {
          let icon: string = item.icon.split(' ')[1];
          icon = icon.replace('-', '_');
          this.languageItems.push({
            value: item.displayName,
            name: item.name,
            some: item.displayName,
            id: item.id,
            icon: icon,
            iconWidth: '21px',
            iconHeight: '14px',
          });
          if (res.defaultLanguageName === item.name) {
            this.selectedLanguage.language = item.displayName;
            this.selectedLanguage.icon = item.icon.split(' ')[1];
          }
          languages.push(item.name);
        });
        if (res.defaultLanguageName) {
          this.store.dispatch(setDefaultLanguageForUI(res.defaultLanguageName));
          this.translate.use(res.defaultLanguageName);
        }

        // this.translate.addLangs(languages);
      }
    });
    if (this.router.url) {
      let matchRoute: any;
      const index = this.getMatchedRoute(this.sidenavItems);
      if (index !== -1) {
        this.activePage = index;
        this.selectedMenu = this.sidenavItems[index].label;
        this.selectedMenuDescription = this.sidenavItems[index].description;
      } else {
        this.sidenavItems.forEach((menu: any, i: number) => {
          if (menu.children && menu.children.length > 0) {
            const index = this.getMatchedRoute(menu.children);
            if (index !== -1) {
              this.activePage = i;
              this.activesubmenu = index;
              this.selectedMenu = menu.children[index].label;
              this.selectedMenuDescription = menu.children[index].description;
            }
          }
        });
      }
      
    }

    this.store.dispatch(getMLATenancyData());

    this.store.select(selectTenancyData).subscribe((res) => {
      this.linkedAccountData = [];
      if (res && res.items) {
        const data: any = [];
        res.items.forEach((item: any) => {
          const _item: any = {
            id: item.id,
            username: item.username,
            tenancyName: item.tenancyName,
            tenantId: item.tenantId,
          };
          this.linkedAccountData.push(_item);
        });
      }
    });
    this.sub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.accountPage = ['/login', '/forgot-password'].includes(event.url);
      }
    });
    if (this.sidenavItems && this.sidenavItems.length > 0) {
      if (
        this.sidenavItems[0].children &&
        this.sidenavItems[0].children.length > 0
      ) {
        this.selectedMenu = this.sidenavItems[0].children[0].label;
        this.selectedMenuDescription =
          this.sidenavItems[0].children[0].description;
      } else {
        this.selectedMenu = this.sidenavItems[0].label;
        this.selectedMenuDescription = this.sidenavItems[0].description;
      }
    }

    this.store.dispatch(getProfile());
    this.store.select(selectProfileInfo).subscribe((res: any) => {
      if (res) {
        this.profileData = res;
      }
    })

    this.store.dispatch(getDelegations());
    this.store.select(selectDelegationsInfo).subscribe((res: any) => {
      this.rdsDeligateTableData = [];
      if (res && res.items && res.items.length) {
        res.items.forEach((element: any) => {
          const item: any = {
            username: element.username,
            startTime: element.startTime,
            endTime: element.endTime,
            id: element.id,
          };
          this.rdsDeligateTableData.push(item);
        });
      }
    });
    const UsernameFilter: any = {
      excludeCurrentUser: true,
      filter: '',
      maxResultCount: 10,
      skipCount: 0,
    };
    this.store.dispatch(getUsername(UsernameFilter));
    this.store.select(selectUserFilter).subscribe((res: any) => {
      if (res && res.items && res.items.length) {
        res.items.forEach((res: any) => {
          const item: any = {
            value: res.value,
            some: res.name,
            isSelected: res.isSelected,
            icon: '',
            iconWidth: 0,
            iconHeight: 0,
            iconFill: false,
            iconStroke: true,
            isFree: res.isFree

          };
          this.usernameList.push(item);
        });
     
      }
    });
    this.sub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.accountPage = ['/login', '/forgot-password'].includes(event.url);
      }
    });

  }

  onLanguageSelection(lan) {
    this.translate.use(lan);
    this.store.dispatch(setDefaultLanguageForUI(lan));
  }
  deleteDeligateuser(data: any){
    if (data) {
      this.store.dispatch(deleteDelegations(data.id));
    }
  }
  saveDeligate(data: any) {
    if (data) {
      this.store.dispatch(saveDelegations(data));
    }
  }
  onProfileSave(passwordInfo: any){
    if (passwordInfo) {
      this.store.dispatch(changePassword(passwordInfo));
    }
  }
  logoutEmitter($event){
      if (this.counter < 1) {
        this.userAuthService.unauthenticateUser();
        this.counter++;
      }
  }
  deleteLinkaccount (data: any){
    this.store.dispatch(deleteAccount(data));
  }
  onDownloadLink(data: any){
    this.store.dispatch(PrepareCollectedData());
  }
  onLoginAttemptsRefresh(data: any){
    this.store.dispatch(getLoginAttempts(data));
    this.store.select(selectAllLoginAttempts).subscribe((res: any) => {
      if (res && res.items) {
        this.LoginAttempts.LoginDatatable = [];
        res.items.forEach((element: any) => {
          const item: any = {
            browserInfo: element.browserInfo,
            clientIpAddress: element.clientIpAddress,
            clientName: element.clientName,
            creationTime: element.creationTime,
            result: element.result,
            tenancyName: element.tenancyName,
            userNameOrEmail: element.userNameOrEmail,
          };
          this.LoginAttempts.LoginDatatable.push(item);
        });
      }
    });
  }
  onAlertHide(event: any){
    this.currentAlerts = event;
  }
  
  linkUser(data: any){
    debugger
    this.store.dispatch(linkToUser(data));
  }
  setAllNotificationAsRead($event){
    this.store.dispatch(SetAllNotificationsAsRead());
  }
  setNotificationAsRead(data: any){
    this.store.dispatch(
      SetNotificationRead({ id: data.userNotificationId })
    );
  }
  onUpdateNotificationSettings(data: any){
    this.store.dispatch(updateNotificationSettings(data));
  }
  onProfileData(event: any){
    this.store.dispatch(getProfilepic());
  }

  selectAllvisualSettings() {
    this.store.select(selectAllVisualsettings).subscribe((res: any) => {
      if (res && res.length > 0) {
        const header = JSON.parse(
          res[this.index].header.minimizeDesktopHeaderType
        );
        if (header) {
          this.fixedHeader = header.desktop;
          if (header.desktop) {
            this.document.getElementById('FixedHeaderOverFlow').style.overflow =
              'scroll';
            document.getElementsByTagName('html')[0].style.overflow = 'hidden';
          } else {
            this.document.getElementById('FixedHeaderOverFlow').style.overflow =
              'inherit';
            document.getElementsByTagName('html')[0].style.overflow = 'inherit';
          }
          this.FixedHeaderBody = header.desktop;
        }
        this.collapseRequired = res[this.index].menu.allowAsideMinimizing;

        if (res[this.index].menu.defaultMinimizedAside) {
          if (this.sideMenuCollapsed == false) {
            document.getElementById('sidenavCollapsed').click();
          }
        } else {
          if (this.sideMenuCollapsed == true) {
            document.getElementById('sidenavCollapsed').click();
          }
        }
      }
    });
  }
  redirectPath(event): void {
    this.currentAlerts = [];
    this.selectedMenu = event.label;
    this.selectedMenuDescription = event.description;
    this.router.navigate([event.path]);
    var alertNode = document.querySelector('.alert');
    if (alertNode) {
      var alert = bootstrap.Alert.getInstance(alertNode);
      if (alert) {
        alert.close();
      }
    }
    this.shared.setTopNavTitle('');
    this.shared.setSideBarStatus(true)
  }
  redirect(event): void { }

  onCollapse(event): void {
    this.sideMenuCollapsed = event;
  }

  subscribeToAlerts() {
    this.alertService.alertEvents.subscribe((alert) => {
      this.currentAlerts = [];
      const currentAlert: any = {
        type: alert.type,
        title: alert.title,
        message: alert.message,
      };
      this.currentAlerts.push(currentAlert);
      this.showDelegationButtonSpinner = false;
    });
  }
  getMatchedRoute(menus): number {
    return menus.findIndex((x: any) => x.path === this.router.url);
  }
  format(userNotification) {
    let formatted = {
      userNotificationId: userNotification.id,
      title: userNotification.notification.notificationName,
      time: moment(
        new Date(userNotification.notification.creationTime),
        'YYYY-MM-DD hh:mm:ss'
      ).fromNow(),
      creationTime: userNotification.notification.creationTime,
      data: userNotification.notification.data,
      status: this.severity[userNotification.notification.severity],
      url: this.getUrl(userNotification),
      state: userNotification.state,
    };
    return formatted;
  }
  formatDate(date: DateTime | Date, format: string): string {
    if (date instanceof Date) {
      return this.formatDate(this.fromJSDate(date), format);
    }

    return date.toFormat(format);
  }
  fromJSDate(date: Date): DateTime {
    return DateTime.fromJSDate(date);
  }

  getUrl(userNotification): string {
    switch (userNotification.notification.notificationName) {
      case 'App.NewUserRegistered':
        return (
          '/app/admin/users?filterText=' +
          userNotification.notification.data.properties.emailAddress
        );
      case 'App.NewTenantRegistered':
        return (
          '/app/admin/tenants?filterText=' +
          userNotification.notification.data.properties.tenancyName
        );
      case 'App.GdprDataPrepared':
        return (
          '/File/DownloadBinaryFile?id=' +
          userNotification.notification.data.properties.binaryObjectId +
          '&contentType=application/zip&fileName=collectedData.zip'
        );
      case 'App.DownloadInvalidImportUsers':
        return (
          '/File/DownloadTempFile?fileToken=' +
          userNotification.notification.data.properties.fileToken +
          '&fileType=' +
          userNotification.notification.data.properties.fileType +
          '&fileName=' +
          userNotification.notification.data.properties.fileName
        );
      //Add your custom notification names to navigate to a URL when user clicks to a notification.
    }

    //No url for this notification
    return '';
  }

  toggleBetweenMode(event: any) {
    let checked = event;
    let selectedTheme: string = 'default';
    if (!checked) {
      this.theme.theme = 'dark';
      localStorage.setItem('THEME', 'dark');
      selectedTheme = 'dark'
      localStorage.setItem('themeIndex', '7');

    } else {
      this.theme.theme = 'light';
      localStorage.setItem('THEME', 'light');
      selectedTheme = 'default';
      localStorage.setItem('themeIndex', '12');

    }
    this.alertService.setTheme(selectedTheme);
  }

  private filterNavItems(
    sidenavItemsOriginal,
    grantedPermissions: any,
    sidenavItems: any[]
  ) {
    sidenavItemsOriginal.forEach((node) => {
      if (
        grantedPermissions[node.permissionName] === 'true' ||
        node.permissionName == ''
      ) {
        let childrenValue = node.children ? [] : undefined;
        var item: any = {
          children: childrenValue,
          label: node.label,
          id: node.id,
          permissionName: node.permissionName,
          icon: node.icon,
          path: node.path,
          description: node.description,
          labelTranslationKey: node.labelTranslationKey,
        };

        if (node.children != undefined) {
          this.filterNavItems(node.children, grantedPermissions, item.children);
        }
        sidenavItems.push(item);
      }
    });
  }

  public getSideNavItems(): any {
    this.sidenavItems = this.translateMenu(this.sidenavItems);
    return this.sidenavItems;
  }

  private translateMenu(sidenavItems): any {
    sidenavItems.forEach((menu: any) => {
      menu.label = this.translate.instant(menu.labelTranslationKey);
      if (menu.children && menu.children.length > 0) {
        this.translateMenu(menu.children);
      }
    });
    return sidenavItems;
  }


  setTheme(selectedTheme: any): void {
    if (selectedTheme == "undefined" || selectedTheme == '' || selectedTheme == 'light' || selectedTheme == 'default' || selectedTheme == undefined || selectedTheme == null) {
      this.theme.theme = 'light';
      localStorage.setItem('THEME', 'light');
      this.isLightMode = true;
    } else {
      this.theme.theme = 'dark';
      this.isLightMode = false;
    }
    if (selectedTheme !== undefined && selectedTheme !== '' && selectedTheme !== 'undefined') {
      if (selectedTheme == 'light') {
        selectedTheme = 'default';
      }
      const headEl = this.document.getElementsByTagName('head')[0];
      const existingLinkEl = this.document.getElementById(
        'client-theme'
      ) as HTMLLinkElement;
      const newLinkEl = this.document.createElement('link');

      if (existingLinkEl) {
        existingLinkEl.href = selectedTheme + '.css';
      } else {
        newLinkEl.id = 'client-theme';
        newLinkEl.rel = 'stylesheet';
        newLinkEl.href = selectedTheme + '.css';
        headEl.appendChild(newLinkEl);
      }
    }
  }

}
