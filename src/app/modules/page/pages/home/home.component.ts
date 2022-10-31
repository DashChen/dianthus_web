import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  menuItems = [
    //{ id: 'menu1', img: 'assets/images/menu1-btn-img.png', router: '/page/create-ws' },
    { id: 'menu4', img: 'assets/images/menu1-btn-img.png', router: '/page/create-ws-new' },
    //{ id: 'menu2', img: 'assets/images/menu2-btn-img.png', router: '/page/search-ws' },
    { id: 'menu5', img: 'assets/images/menu2-btn-img.png', router: '/page/search-ws-new' },
    { id: 'menu3', img: 'assets/images/menu3-btn-img.png', router: '' },
   
  ]

  constructor() { }

  ngOnInit(): void {

  }

}
