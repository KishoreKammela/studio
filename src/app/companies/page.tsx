'use client';
import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  orderBy,
  query as firestoreQuery,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Company } from '@/types';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

// Note: Metadata for client components is typically handled by the nearest server component parent (e.g., layout.tsx or a specific server page.tsx).
// For a page like this which is client-rendered, the root layout.tsx's metadata or a specific server wrapper would set the primary metadata.
// We can add dynamic title updates via useEffect if needed.

const COMPANIES_PER_PAGE = 9;

export default function CompaniesListPage() {
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    document.title = 'Explore Companies - Find Your Next Employer | JobBoardly';
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const companiesCollectionRef = collection(db, 'companies');
        const q = firestoreQuery(
          companiesCollectionRef,
          where('status', '==', 'approved'),
          orderBy('name', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const companiesData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt,
            updatedAt:
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate().toISOString()
                : data.updatedAt,
          } as Company;
        });
        setAllCompanies(companiesData);
        setFilteredCompanies(companiesData);
      } catch (e: unknown) {
        console.error('Error fetching companies:', e);
        setError(
          `Failed to load companies. Please try again later. Error: ${(e as Error).message}`
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const newFilteredCompanies = allCompanies.filter(
      (company) =>
        company.name.toLowerCase().includes(lowercasedFilter) ||
        (company.description &&
          company.description.toLowerCase().includes(lowercasedFilter))
    );
    setFilteredCompanies(newFilteredCompanies);
    setCurrentPage(1);
  }, [searchTerm, allCompanies]);

  const totalPages = Math.ceil(filteredCompanies.length / COMPANIES_PER_PAGE);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * COMPANIES_PER_PAGE,
    currentPage * COMPANIES_PER_PAGE
  );

  // const CompanySkeletonCard = () => (
  //   <Card className="shadow-sm flex flex-col">
  //     <CardHeader className="flex-row items-center gap-4 p-4">
  //       <Skeleton className="h-16 w-16 rounded-md" />
  //       <div className="space-y-2 flex-1">
  //         <Skeleton className="h-6 w-3/4 rounded" />
  //         <Skeleton className="h-4 w-1/2 rounded" />
  //       </div>
  //     </CardHeader>
  //     <CardContent className="p-4 pt-0 space-y-2 flex-grow">
  //       <Skeleton className="h-4 w-full rounded" />
  //       <Skeleton className="h-4 w-5/6 rounded" />
  //     </CardContent>
  //     <CardFooter className="p-4 border-t">
  //       {' '}
  //       <Skeleton className="h-9 w-full rounded-md" />
  //     </CardFooter>
  //   </Card>
  // );

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold font-headline mb-2">
          Explore Companies
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover great places to work and their open opportunities.
        </p>
      </div>

      <div className="mb-8 max-w-xl mx-auto">
        <Input
          type="text"
          placeholder="Search companies by name or keyword..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          className="h-12 text-lg"
          aria-label="Search companies"
        />
      </div>
      <Separator className="my-8" />

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading companies...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : paginatedCompanies.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCompanies.map((company) => (
              <Card
                key={company.id}
                className="hover:shadow-lg transition-shadow duration-300 flex flex-col"
              >
                <CardHeader className="flex-row items-center gap-4 p-4">
                  <Avatar className="h-16 w-16 border">
                    <AvatarImage
                      src={
                        company.logoUrl || `https://placehold.co/100x100.png`
                      }
                      alt={`${company.name} logo`}
                      data-ai-hint="company logo"
                    />
                    <AvatarFallback className="text-xl">
                      {company.name?.[0]?.toUpperCase() || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-xl font-headline leading-tight hover:text-primary transition-colors">
                      <Link href={`/companies/${company.id}`}>
                        {company.name}
                      </Link>
                    </h2>
                    {company.websiteUrl && (
                      <a
                        href={
                          company.websiteUrl.startsWith('http')
                            ? company.websiteUrl
                            : `https://${company.websiteUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" /> Website
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow">
                  <CardDescription className="line-clamp-3 text-sm">
                    {company.description || 'No description available.'}
                  </CardDescription>
                </CardContent>
                <CardFooter className="p-4 border-t">
                  {' '}
                  <Button asChild className="w-full">
                    <Link href={`/companies/${company.id}`}>
                      View Company Profile
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center gap-2">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="outline"
                aria-label="Previous page of companies"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                variant="outline"
                aria-label="Next page of companies"
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">
            No companies found matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
}
