import { Code } from '@/domain/code';
import { Product } from '@/domain/product';
import { ProductService } from '@/service/productservice';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

@Component({
    selector: 'basic-doc',
    standalone: false,
    template: `
        <app-docsectiontext>
            <p>OrderList is used as a controlled input with <i>value</i> property. Content of a list item needs to be defined with the <i>item</i> template that receives an object in the list as parameter.</p>
        </app-docsectiontext>
        <div class="card sm:flex sm:justify-center">
            <p-orderlist [value]="products" dataKey="id" [responsive]="true" breakpoint="575px">
                <ng-template #item let-option>
                    {{ option.name }}
                </ng-template>
            </p-orderlist>
        </div>
        <app-code [code]="code" selector="orderlist-basic-demo" [extFiles]="extFiles"></app-code>
    `,
    styles: [
        `
            @media (min-width: 576px) {
                :host ::ng-deep .p-listbox {
                    width: 14rem;
                }
            }
        `
    ]
})
export class BasicDoc implements OnInit {
    products!: Product[];

    constructor(
        private productService: ProductService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.productService.getProductsSmall().then((cars) => {
            this.products = cars;
            this.cdr.detectChanges();
        });
    }

    getSeverity(status: string) {
        switch (status) {
            case 'INSTOCK':
                return 'success';
            case 'LOWSTOCK':
                return 'warning';
            case 'OUTOFSTOCK':
                return 'danger';
        }
    }

    code: Code = {
        basic: `<p-orderlist [value]="products" dataKey="id" [responsive]="true" breakpoint="575px">
    <ng-template #item let-option>
        {{ option.name }}
    </ng-template>
</p-orderlist>`,

        html: `<div class="card sm:flex sm:justify-center">
    <p-orderlist [value]="products" dataKey="id" [responsive]="true" breakpoint="575px">
        <ng-template #item let-option>
            {{ option.name }}
        </ng-template>
    </p-orderlist>
</div>`,

        typescript: `import { Component, OnInit } from '@angular/core';
import { Product } from '@/domain/product';
import { ProductService } from '@/service/productservice';
import { OrderListModule } from 'primeng/orderlist';

@Component({
    selector: 'orderlist-basic-demo',
    templateUrl: './orderlist-basic-demo.html',
    standalone: true,
    imports: [OrderListModule],
    providers: [ProductService],
    styles: [
    \`@media (min-width: 576px) {
            :host ::ng-deep .p-listbox {
                width: 14rem;
            }
        }\`
    ],

})
export class OrderlistBasicDemo implements OnInit {
    products!: Product[];

    constructor(private productService: ProductService) {}

    ngOnInit() {
        this.productService.getProductsSmall().then((cars) => (this.products = cars));
    }

    getSeverity(status: string) {
        switch (status) {
            case 'INSTOCK':
                return 'success';
            case 'LOWSTOCK':
                return 'warning';
            case 'OUTOFSTOCK':
                return 'danger';
        }
    }
}`,

        data: `
/* ProductService */
{
    id: '1000',
    code: 'f230fh0g3',
    name: 'Bamboo Watch',
    description: 'Product Description',
    image: 'bamboo-watch.jpg',
    price: 65,
    category: 'Accessories',
    quantity: 24,
    inventoryStatus: 'INSTOCK',
    rating: 5
},
...`,

        service: ['ProductService']
    };

    extFiles = [
        {
            path: 'src/domain/product.ts',
            content: `
export interface Product {
    id?: string;
    code?: string;
    name?: string;
    description?: string;
    price?: number;
    quantity?: number;
    inventoryStatus?: string;
    category?: string;
    image?: string;
    rating?: number;
}`
        }
    ];
}
