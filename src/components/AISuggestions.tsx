'use client';

import { useState } from 'react';
import { ChefHat, Loader2, ServerCrash } from 'lucide-react';
import {
  suggestRecipes,
  type SuggestRecipesOutput,
} from '@/ai/flows/ai-suggested-recipes';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from './ui/skeleton';

interface AISuggestionsProps {
  meatCut: string;
}

export function AISuggestions({ meatCut }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestRecipesOutput | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasTriggered, setWasTriggered] = useState(false);

  const handleGetSuggestions = async () => {
    setLoading(true);
    setError(null);
    setSuggestions(null);
    setWasTriggered(true);

    try {
      const result = await suggestRecipes({ meatCut });
      setSuggestions(result);
    } catch (e) {
      console.error(e);
      setError(
        'Hubo un error al generar las sugerencias. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderLoadingState = () => (
    <div className="space-y-4 mt-4">
      <Skeleton className="h-8 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="h-8 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );

  return (
    <div className="mt-6 p-4 border-t">
      <h3 className="text-lg font-semibold font-headline flex items-center gap-2">
        <ChefHat className="text-primary" />
        Sugerencias del Chef (IA)
      </h3>
      <p className="text-sm text-muted-foreground mt-1">
        ¿No sabes cómo preparar este corte? Deja que nuestra IA te inspire con
        recetas y consejos.
      </p>

      {!wasTriggered && (
        <Button
          onClick={handleGetSuggestions}
          disabled={loading}
          className="mt-4 w-full sm:w-auto"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Obtener Sugerencias'
          )}
        </Button>
      )}

      {loading && renderLoadingState()}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {suggestions && (
        <div className="mt-4 space-y-6 text-left">
          <div>
            <h4 className="font-bold">Consejos de Preparación</h4>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              {suggestions.preparationTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold">Recetas Sugeridas</h4>
            <Accordion type="single" collapsible className="w-full mt-2">
              {suggestions.recipeSuggestions.map((recipe, i) => (
                <AccordionItem value={`item-${i}`} key={i}>
                  <AccordionTrigger>{recipe.recipeName}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold">Ingredientes:</h5>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
                          {recipe.ingredients.map((ing, j) => (
                            <li key={j}>{ing}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold">Instrucciones:</h5>
                        <p className="text-sm whitespace-pre-wrap">
                          {recipe.instructions}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div>
            <h4 className="font-bold">Productos Complementarios</h4>
            <div className="mt-2 space-y-3">
              {suggestions.complementaryProducts.map((product, i) => (
                <div key={i} className="p-3 bg-secondary rounded-lg">
                  <p className="font-semibold">{product.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
