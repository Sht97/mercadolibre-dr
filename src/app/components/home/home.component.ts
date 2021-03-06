import {Component, Input, OnInit} from '@angular/core';
import {MercadolibreService} from '../../core/services/mercadolibre.service';
import {CartService} from '../../core/services/cart.service';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  slider = [
    {
      src: 'https://http2.mlstatic.com/optimize/o:f_webp/resources/deals/exhibitors_resources/mco-home-desktop-slider-picture-9da47314-157a-4270-81b1-8ec999313eca.jpg',
      search: 'Bebidas alcoholicas'
    },
    {
      src: 'https://http2.mlstatic.com/optimize/o:f_webp/resources/deals/exhibitors_resources/mco-home-desktop-slider-picture-e8adad68-f714-4c67-b37b-0c95a1432307.jpg',
      search: 'Tecnología'
    },
    {
      src: 'https://http2.mlstatic.com/optimize/o:f_webp/resources/deals/exhibitors_resources/mco-home-desktop-slider-picture-f2452add-8bf6-4852-9cc1-10b5b746c329.jpg',
      search: 'Deportes'
    }
  ];
  results: any[] = [];
  itemSearch: string;
  offset: number;
  // tslint:disable-next-line:max-line-length
  constructor(private mercadolibreService: MercadolibreService, private route: ActivatedRoute, private router: Router, private cartService: CartService) {
    this.offset = 0;
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params.search !== undefined){
        this.itemSearch = params.search;
      }
      else {
        this.itemSearch = this.slider[Math.floor(Math.random() * this.slider.length)].search;
      }
      this.offset = 0;
      this.search(this.itemSearch, 0);
    });

  }
  search(item, offset): void{
    this.results = [];
    this.mercadolibreService.getProducts(item , offset).subscribe(data => {
      data.results.map(product => {
        product.imgHd = product.thumbnail.replace('-I', '-V');
        this.mercadolibreService.getSellerName(product.seller.id).subscribe(name => {
          product.seller_name = name.nickname;
          if (product.original_price !== null){
            product.discount = this.calculateDiscount(product.price, product.original_price);
          }
        });
        this.results.push(product);
      });
    });
  }
  toProduct(productID): void{
    this.router.navigate(['/product'], {queryParams: {productId: productID }});
  }
  nextPage(): void{
    this.offset += 1;
    this.search(this.itemSearch, this.offset);
  }
  previousPage(): void{
    this.offset -= 1;
    this.search(this.itemSearch, this.offset);
  }
  toPage(pageNumber): void{
    this.offset = pageNumber;
    this.search(this.itemSearch, this.offset);
  }
  addToCart(itemId): void {
    this.cartService.addItem(itemId);
  }
  calculateDiscount(price, originalPrice): number{
    const discount = 100 - (price * 100) / originalPrice;
    return Math.floor(discount);
  }

}
