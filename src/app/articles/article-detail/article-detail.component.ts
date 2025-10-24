import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';

interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  imageUrl: string;
  readTime: number;
  category: string;
  tags: string[];
}

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss']
})
export class ArticleDetailComponent implements OnInit {
  article: Article | null = null;
  isLoading = true;
  error: string | null = null;
  
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly clipboard: Clipboard
  ) {}
  
  ngOnInit() {
    const articleId = this.route.snapshot.paramMap.get('id');
    this.loadArticle(articleId);
  }
  
  private loadArticle(id: string | null) {
    // Fetch article data based on the ID
    // In a real app, this would be an HTTP request to your backend
    setTimeout(() => {
      if (!id) {
        this.error = 'Article not found';
        this.isLoading = false;
        return;
      }
      
      // Mock data - replace with actual API call
      this.article = {
        id: id,
        title: 'Getting Started with Angular',
        content: `
          <p>Angular is a powerful front-end framework that makes it easy to build web applications. In this article, we'll cover the basics of getting started with Angular.</p>
          <h2>Prerequisites</h2>
          <p>Before you begin, make sure you have Node.js and npm installed on your system.</p>
          <h2>Installation</h2>
          <p>To install the Angular CLI, run the following command:</p>
          <pre><code>npm install -g @angular/cli</code></pre>
          <h2>Creating a New Project</h2>
          <p>Create a new Angular project by running:</p>
          <pre><code>ng new my-angular-app</code></pre>
          <p>Navigate to your project directory and start the development server:</p>
          <pre><code>cd my-angular-app
ng serve --open</code></pre>
        `,
        author: 'John Doe',
        date: '2023-10-15',
        imageUrl: 'https://via.placeholder.com/800x400',
        readTime: 5,
        category: 'Angular',
        tags: ['angular', 'tutorial', 'beginners']
      };
      
      this.isLoading = false;
    }, 1000);
  }
  
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  shareArticle(): void {
    const url = globalThis.location.href;
    this.clipboard.copy(url);
    this.snackBar.open('Link copied to clipboard!', 'Dismiss', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
