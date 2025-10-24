import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  imageUrl: string;
  readTime: number;
}

@Component({
  selector: 'app-articles-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './articles-list.component.html',
  styleUrls: ['./articles-list.component.scss']
})
export class ArticlesListComponent implements OnInit {
  articles: Article[] = [];
  isLoading = true;
  
  ngOnInit() {
    // TODO: Replace with actual API call
    setTimeout(() => {
      this.articles = [
        {
          id: '1',
          title: 'Getting Started with Angular',
          excerpt: 'Learn the basics of Angular and build your first application.',
          author: 'John Doe',
          date: '2023-10-15',
          imageUrl: 'https://via.placeholder.com/300x200',
          readTime: 5
        },
        // Add more sample articles as needed
      ];
      this.isLoading = false;
    }, 1000);
  }
}
