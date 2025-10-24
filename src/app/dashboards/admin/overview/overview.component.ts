import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatisticsService, TagStats, ArticleStats, TopAuthor } from './statistics.service';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

Chart.register(...registerables);

interface Stats {
  totalArticles: number;
  totalAuthors: number;
  totalComments: number;
  totalTags: number;
  totalViews: number;
  articlesThisMonth: number;
  articlesLastMonth: number;
}

interface Article {
  id: string;
  title: string;
  views: number;
  commentCount: number;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  articleTitle: string;
  date: string;
}

interface Tag extends TagStats {
  id?: string;  // Optional for backward compatibility
  name?: string; // Optional for backward compatibility
}

type DateRange = 'week' | 'month' | 'year';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BaseChartDirective,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule
  ]
})
export class OverviewComponent implements OnInit {
  // Statistics data
  stats: Stats = {
    totalArticles: 0,
    totalAuthors: 0,
    totalComments: 0,
    totalTags: 0,
    totalViews: 0,
    articlesThisMonth: 0,
    articlesLastMonth: 0
  };

  // Top content
  topArticles: Article[] = [];
  topViewedArticles: ArticleStats[] = [];
  recentComments: Comment[] = [];
  popularTags: Tag[] = [];
  topTags: Tag[] = [];
  topAuthors: TopAuthor[] = [];
  
  // Loading states
  loading = true;
  chartsLoading = true;
  
  // Doughnut chart data
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
    }]
  };
  
  // Date range for filters
  dateRange: DateRange = 'month';

  // Chart configurations
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Month',
          color: '#666',
          font: {
            weight: 'bold'
          }
        },
        grid: {
          display: false
        },
        ticks: {
          color: '#666'
        },
        offset: true
      },
      y: {
        type: 'linear',
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
          color: '#666',
          callback: (value) => Number.isInteger(value) ? value : ''
        },
        title: {
          display: true,
          text: 'Number of Articles',
          color: '#666',
          font: {
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        min: 0
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#666',
          font: {
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} article${value !== 1 ? 's' : ''}`;
          }
        }
      }
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Articles Published',
      backgroundColor: 'rgba(63, 81, 181, 0.7)',
      borderColor: 'rgba(63, 81, 181, 1)',
      borderWidth: 1,
      barThickness: 'flex' as const,
      borderRadius: 4,
      barPercentage: 0.8,
      categoryPercentage: 0.9
    }]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Views'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)'
      }
    }
  };
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Views',
      borderColor: 'rgba(63, 81, 181, 1)',
      backgroundColor: 'rgba(63, 81, 181, 0.2)',
      pointBackgroundColor: 'rgba(63, 81, 181, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(63, 81, 181, 0.8)',
      fill: 'origin',
    }]
  };

  formatNumber(num: number | undefined): string {
    if (num === null || num === undefined) return '0';
    return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();
  }

  get Math() {
    return Math;
  }

  calculateTrend(current: number, previous: number): { value: number; isPositive: boolean } {
    if (previous === 0) return { value: 100, isPositive: true };
    const value = ((current - previous) / previous) * 100;
    return {
      value: Math.round(value * 10) / 10,
      isPositive: value >= 0
    };
  }

  constructor(private readonly statsService: StatisticsService) {}
  
  formatDate(dateString: string | Date): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  onDateRangeChange(range: DateRange): void {
    this.dateRange = range;
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.chartsLoading = true;
    
    this.resetStats();
    this.topViewedArticles = [];
    this.recentComments = [];
    this.topTags = [];
    this.topAuthors = [];
    
    Promise.all([
      this.loadOverview(),
      this.loadMonthlyArticles(),
      this.loadTopViewedArticles(),
      this.loadTopTags(),
      this.loadTopAuthors(),
      this.loadRecentComments()
    ]).finally(() => {
      this.loading = false;
      this.chartsLoading = false;
    });
  }
  
  private loadOverview(): Promise<void> {
    return new Promise((resolve) => {
      this.statsService.getOverview().subscribe({
        next: (response) => {
          
          if (response?.success) {
            if (response.data) {
              const { totalArticles, totalAuthors, totalComments, totalTags } = response.data;
              this.stats = {
                totalArticles: totalArticles || 0,
                totalAuthors: totalAuthors || 0,
                totalComments: totalComments || 0,
                totalTags: totalTags || 0,
                totalViews: 0,
                articlesThisMonth: 0,
                articlesLastMonth: 0
              };
            } else {
              this.resetStats();
            }
          } else {
            this.resetStats();
          }
          resolve();
        },
        error: (error) => {
          this.resetStats();
          resolve(error);
        }
      });
    });
  }

  private resetStats(): void {
    this.stats = {
      totalArticles: 0,
      totalAuthors: 0,
      totalComments: 0,
      totalTags: 0,
      totalViews: 0,
      articlesThisMonth: 0,
      articlesLastMonth: 0
    };
  }
  
  private loadMonthlyArticles(): Promise<void> {
    return new Promise((resolve) => {
      this.statsService.getArticlesPerMonth().subscribe({
        next: (response) => {
          
          if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
            try {
              const sortedData = [...response.data]
                .map(item => ({
                  ...item,
                  date: new Date(item.date).toISOString().split('T')[0]
                }))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
              
              const labels = sortedData.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                });
              });
              
              this.barChartData = {
                labels: labels,
                datasets: [{
                  ...this.barChartData.datasets[0],
                  data: sortedData.map(item => item.count || 0)
                }]
              };              
            } catch (error) {
              this.setEmptyChartData();
            }
          } else {
            this.setEmptyChartData();
          }
          resolve();
        },
        error: (error) => {
          this.setEmptyChartData();
          resolve();
        }
      });
    });
  }

  private setEmptyChartData(): void {
    this.barChartData = {
      labels: ['No data'],
      datasets: [{
        label: 'No Data',
        data: [0],
        backgroundColor: 'rgba(200, 200, 200, 0.5)',
        borderColor: 'rgba(200, 200, 200, 1)',
        borderWidth: 1
      }]
    };
  }

  private loadTopViewedArticles(): Promise<void> {
    return new Promise((resolve) => {
      this.statsService.getTopViewedArticles().subscribe({
        next: (response) => {
          if (response.success && Array.isArray(response.data)) {
            this.topViewedArticles = response.data.map(article => ({
              ...article,
              id: article._id,
              views: article.views || 0,
              commentCount: article.commentCount || 0
            }));
          } else {
            this.topViewedArticles = [];
          }
          resolve();
        },
        error: (error) => {
          console.error('Error loading top viewed articles:', error);
          this.topViewedArticles = [];
          resolve();
        }
      });
    });
  }

  private loadTopTags(): Promise<void> {
    return new Promise((resolve) => {
      this.statsService.getTopTags().subscribe({
        next: (response) => {
          if (response?.success && Array.isArray(response.data)) {
            this.popularTags = response.data.map(tag => ({
              count: tag.count || 0,
              tag: tag.tag,
              name: tag.tag,
              id: tag.tag
            }));
            this.doughnutChartData = {
              labels: response.data.map(tag => tag.tag),
              datasets: [{
                data: response.data.map(tag => tag.count || 0),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
              }]
            };
          } else {
            this.popularTags = [];
            this.doughnutChartData = {
              labels: [],
              datasets: [{
                data: [],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
              }]
            };
          }
          resolve();
        },
        error: (error) => {
          this.topTags = [];
          this.doughnutChartData = {
            labels: [],
            datasets: [{
              data: [],
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }]
          };
          resolve();
        }
      });
    });
  }

private loadTopAuthors(): Promise<void> {
  return new Promise((resolve) => {
    this.statsService.getTopAuthors().subscribe({
      next: (response) => {
        if (response?.success && Array.isArray(response.data)) {
          this.topAuthors = response.data.map(author => ({
            ...author,
            name: author.name || 'Unknown Author'
          }));
        } else {
          this.topAuthors = [];
        }
        resolve();
      },
      error: (error) => {
        this.topAuthors = [];
        resolve();
      }
    });
  });
}

private loadRecentComments(): Promise<void> {
  return new Promise((resolve) => {
    this.recentComments = [
      {
        id: '1',
        author: 'John Doe',
        text: 'This is a sample comment',
        articleTitle: 'Sample Article',
        date: new Date().toISOString()
      }
    ];
    resolve();
  });
}
}