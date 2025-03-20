import { test, expect } from '@playwright/test';

test.describe('Emotion History Component', () => {
    
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/emotions'); 
    });

    test('should load the Emotion History component', async ({ page }) => {
        const title = page.locator('h2'); 
        await expect(title).toHaveText('Historial de Emociones');
    });

    test('should display a loading spinner while fetching emotions', async ({ page }) => {
        await expect(page.locator('.LoadingSpinner')).toBeVisible();
    });

    test('should show empty state when no emotions are recorded', async ({ page }) => {
        await page.waitForSelector('.EmptyState');
        const emptyText = page.locator('.EmptyState');
        await expect(emptyText).toHaveText('No hay emociones registradas aún');
    });

    test('should show error message and retry button if fetching fails', async ({ page }) => {
        await page.route('**/api/emotions', route => route.abort());

        await page.reload();
        await page.waitForSelector('.ErrorMessage');

        const errorText = page.locator('.ErrorMessage');
        await expect(errorText).toHaveText('Hubo un problema al cargar las emociones');

        const retryButton = page.locator('.RetryButton');
        await expect(retryButton).toBeVisible();
    });

    test('should display recorded emotions correctly', async ({ page }) => {
        await page.waitForSelector('.EmotionList');
        const emotions = page.locator('.EmotionCard');
        await expect(emotions).toHaveCountGreaterThan(0);
    });

    test('should verify emotion triggers and activities are displayed', async ({ page }) => {
        await page.waitForSelector('.EmotionList');

        const trigger = page.locator('.trigger').first();
        const activity = page.locator('.activity').first();

        await expect(trigger).toBeVisible();
        await expect(activity).toBeVisible();
    });

    test('should check intensity and notes for an emotion', async ({ page }) => {
        await page.waitForSelector('.EmotionList');

        const intensity = page.locator('.EmotionIntensity').first();
        await expect(intensity).toContainText('Intensidad');

        const notes = page.locator('.EmotionNotes').first();
        await expect(notes).toBeVisible();
    });

    test('should retry loading when clicking the retry button', async ({ page }) => {
        await page.route('**/api/emotions', route => route.abort());

        await page.reload();
        await page.waitForSelector('.RetryButton');

        const retryButton = page.locator('.RetryButton');
        await retryButton.click();

        await expect(page.locator('.LoadingSpinner')).toBeVisible();
    });

    test('should delete an emotion and update the UI', async ({ page }) => {
        await page.waitForSelector('.EmotionList');

        const deleteButton = page.locator('.DeleteButton').first();
        await expect(deleteButton).toBeVisible();
        await deleteButton.click();

        await page.waitForSelector('.ConfirmationModal');
        const confirmButton = page.locator('.ConfirmationModal button', { hasText: 'Eliminar' });
        await confirmButton.click();

        await expect(page.locator('.EmotionCard')).toHaveCountLessThan(2);
    });
});
