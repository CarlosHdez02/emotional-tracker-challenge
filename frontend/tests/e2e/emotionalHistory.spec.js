import { test, expect } from '@playwright/test';

test.describe('Emotion History Component', () => {
    
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/emotions'); 
    });

    test('should load the Emotion History component', async ({ page }) => {
        const title = await page.locator('h2'); 
        await expect(title).toHaveText('Historial de Emociones');
    });

    test('should display a loading spinner while fetching emotions', async ({ page }) => {
        await page.waitForSelector('.LoadingSpinner', { state: 'visible' });
        const loadingText = await page.locator('.LoadingSpinner').textContent();
        expect(loadingText).toBe('Cargando...');
    });

    test('should show empty state when no emotions are recorded', async ({ page }) => {
        await page.waitForSelector('.EmptyState');
        const emptyText = await page.locator('.EmptyState').textContent();
        expect(emptyText).toContain('No hay emociones registradas aún');
    });

    test('should show error message and retry button if fetching fails', async ({ page }) => {
   
        await page.route('**/api/emotions', route => route.abort()); 
        
        await page.reload(); 
        await page.waitForSelector('.ErrorMessage');

        const errorText = await page.locator('.ErrorMessage').textContent();
        expect(errorText).toContain('Hubo un problema al cargar las emociones');

        const retryButton = await page.locator('.RetryButton');
        await expect(retryButton).toBeVisible();
    });

    test('should display recorded emotions correctly', async ({ page }) => {
        await page.waitForSelector('.EmotionList');
        
        const emotions = await page.locator('.EmotionCard');
        expect(await emotions.count()).toBeGreaterThan(0); 
    });

    test('should verify emotion triggers and activities are displayed', async ({ page }) => {
        await page.waitForSelector('.EmotionList');
        
        const trigger = await page.locator('.trigger').first();
        const activity = await page.locator('.activity').first();

        await expect(trigger).toBeVisible();
        await expect(activity).toBeVisible();
    });

    test('should check intensity and notes for an emotion', async ({ page }) => {
        await page.waitForSelector('.EmotionList');

        const intensity = await page.locator('.EmotionIntensity').first().textContent();
        expect(intensity).toContain('Intensidad');

        const notes = await page.locator('.EmotionNotes').first();
        await expect(notes).toBeVisible();
    });

});
