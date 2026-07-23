export interface Service {
  id: string;
  name: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  description: string;
  category: string;
  categoryId?: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  categoryGradient?: string;
  icon: string;
  image?: string | null;
  route?: string;
  status?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  popular: boolean;
  trending: boolean;
  new: boolean;
  tags: string[];
  sortOrder?: number;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  count: number;
  sortOrder?: number;
}
