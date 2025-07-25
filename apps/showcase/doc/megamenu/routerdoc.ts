import { Code } from '@/domain/code';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MegaMenuItem } from 'primeng/api';

@Component({
    selector: 'router-doc',
    standalone: false,
    template: `
        <app-docsectiontext>
            <p>Menu items support navigation via routerLink, programmatic routing using commands, or external URLs.</p>
        </app-docsectiontext>
        <div class="card">
            <p-megamenu [model]="items" />
        </div>
        <app-code [code]="code" selector="mega-menu-router-demo"></app-code>
    `
})
export class RouterDoc implements OnInit {
    items: MegaMenuItem[] | undefined;

    constructor(private router: Router) {}

    ngOnInit() {
        this.items = [
            {
                label: 'Router',
                icon: 'pi pi-palette',
                items: [
                    [
                        {
                            label: 'RouterLink',
                            items: [
                                { label: 'Theming', routerLink: '/theming' },
                                { label: 'UI Kit', routerLink: '/uikit' }
                            ]
                        }
                    ]
                ]
            },
            {
                label: 'Programmatic',
                icon: 'pi pi-link',
                command: () => {
                    this.router.navigate(['/installation']);
                }
            },
            {
                label: 'External',
                icon: 'pi pi-home',
                items: [
                    [
                        {
                            label: 'External',
                            items: [
                                { label: 'Angular', url: 'https://angular.dev/' },
                                {
                                    label: 'Vite.js',
                                    url: 'https://vitejs.dev/'
                                }
                            ]
                        }
                    ]
                ]
            }
        ];
    }

    code: Code = {
        basic: `<p-megamenu [model]="items" />`,

        html: `<div class="card">
    <p-megamenu [model]="items" />
</div>`,

        typescript: `import { Component, OnInit } from '@angular/core';
import { MegaMenuItem } from 'primeng/api';
import { MegaMenu } from 'primeng/megamenu';
import { Router } from '@angular/router';

@Component({
    selector: 'mega-menu-router-demo',
    templateUrl: './mega-menu-router-demo.html',
    standalone: true,
    imports: [MegaMenu]
})
export class MegaMenuRouterDemo implements OnInit {
    items: MegaMenuItem[] | undefined;

    constructor(private router: Router) {}

    ngOnInit() {
        this.items = [
            {
                label: 'Router',
                icon: 'pi pi-palette',
                items: [
                    [
                        {
                            label: 'RouterLink',
                            items: [
                                { label: 'Theming', routerLink: '/theming' },
                                { label: 'UI Kit', routerLink: '/uikit' }
                            ]
                        }
                    ]
                ]
            },
            {
                label: 'Programmatic',
                icon: 'pi pi-link',
                command: () => {
                    this.router.navigate(['/installation']);
                }
            },
            {
                label: 'External',
                icon: 'pi pi-home',
                items: [
                    [
                        {
                            label: 'External',
                            items: [
                                { label: 'Angular', url: 'https://angular.dev/' },
                                {
                                    label: 'Vite.js',
                                    url: 'https://vitejs.dev/'
                                }
                            ]
                        }
                    ]
                ]
            }
        ];
    }
}`
    };
}
