'use server';
/**
 * @fileOverview An AI agent that suggests recipes, preparation tips, and complementary products based on a selected cut of meat.
 *
 * - suggestRecipes - A function that handles the recipe suggestion process.
 * - SuggestRecipesInput - The input type for the suggestRecipes function.
 * - SuggestRecipesOutput - The return type for the suggestRecipes function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Product } from '@/types/products';
// import { PRODUCTS_DB } from '@/data/products'; // Removed: Data is now in Firestore

const SuggestRecipesInputSchema = z.object({
  meatCut: z.string().describe('The name of the selected cut of meat.'),
});
export type SuggestRecipesInput = z.infer<typeof SuggestRecipesInputSchema>;

const RecipeSuggestionSchema = z.object({
  recipeName: z.string().describe('The name of the suggested recipe.'),
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients required for the recipe.'),
  instructions: z
    .string()
    .describe('Step-by-step instructions for preparing the recipe.'),
});

const ComplementaryProductSchema = z.object({
  productName: z.string().describe('The name of the complementary product.'),
  reason: z
    .string()
    .describe('Why this product complements the selected meat cut.'),
});

const SuggestRecipesOutputSchema = z.object({
  recipeSuggestions: z
    .array(RecipeSuggestionSchema)
    .describe('A list of suggested recipes for the selected meat cut.'),
  preparationTips: z
    .array(z.string())
    .describe('A list of preparation tips for the selected meat cut.'),
  complementaryProducts: z
    .array(ComplementaryProductSchema)
    .describe(
      'A list of products from the catalog that complement the selected meat cut.'
    ),
});
export type SuggestRecipesOutput = z.infer<typeof SuggestRecipesOutputSchema>;

export async function suggestRecipes(
  input: SuggestRecipesInput
): Promise<SuggestRecipesOutput> {
  return suggestRecipesFlow(input);
}

const PromptInputSchema = SuggestRecipesInputSchema.extend({
  products: z.array(z.any()).describe('List of available products'),
});

const prompt = ai.definePrompt({
  name: 'suggestRecipesPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: SuggestRecipesOutputSchema },
  prompt: `You are an expert butcher and chef...

  Suggest 2-3 different recipes, along with preparation tips specific to the following cut of meat:

  Meat Cut: {{{meatCut}}}

  Your suggestions should include:
  *   Recipe names
  *   Ingredients
  *   Step-by-step instructions
  *   Preparation tips
  *   Complementary product suggestions from our catalog.

  Here's our product catalog:
  {{#each products}}
  - {{name}} ({{category}}): {{details}}
  {{/each}}

  Format your output as a JSON object matching the following schema:
  ${JSON.stringify(SuggestRecipesOutputSchema.shape, null, 2)}`,
});

const suggestRecipesFlow = ai.defineFlow(
  {
    name: 'suggestRecipesFlow',
    inputSchema: SuggestRecipesInputSchema,
    outputSchema: SuggestRecipesOutputSchema,
  },
  async (input) => {
    // Populate the products data for the prompt from the product database.
    // Populate the products data for the prompt from the product database.
    // const products = PRODUCTS_DB; // Removed
    const products: any[] = []; // Placeholder until we fetch from Firestore or remove dependency
    const { output } = await prompt({
      ...input,
      products,
    });
    return output!;
  }
);
