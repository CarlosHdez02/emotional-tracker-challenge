import { test, expect } from '@playwright/test';

test.describe('Emotion Tracker Component', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/emotions'); 
    });

    test('should load the Emotion Tracker', async ({ page }) => {
        const title = await page.locator('h2'); 
        await expect(title).toHaveText('¿Cómo te sientes hoy?');
    });

    test('should select an emotion and verify change', async ({ page }) => {
        await page.selectOption('select[name="emotion"]', 'happy');
        const emotionValue = await page.locator('select[name="emotion"]').inputValue();
        expect(emotionValue).toBe('happy');
    });

    test('should adjust intensity slider and verify value', async ({ page }) => {
        const slider = page.locator('input[name="intensity"]');
        await slider.fill('8'); // Set intensity to 8
        const intensityValue = await slider.inputValue();
        expect(intensityValue).toBe('8');
    });

    test('should check triggers and activities', async ({ page }) => {
        await page.check('input[id="trigger-conflict"]'); // Select trigger "Conflicto"
        await page.check('input[id="activity-exercise"]'); // Select activity "Ejercicio"

        const conflictChecked = await page.isChecked('input[id="trigger-conflict"]');
        const exerciseChecked = await page.isChecked('input[id="activity-exercise"]');

        expect(conflictChecked).toBeTruthy();
        expect(exerciseChecked).toBeTruthy();
    });

    test('should type notes and verify text', async ({ page }) => {
        await page.fill('textarea[name="notes"]', 'Hoy fue un día estresante.');
        const notesValue = await page.locator('textarea[name="notes"]').inputValue();
        expect(notesValue).toBe('Hoy fue un día estresante.');
    });

    test('should submit the form and show success message', async ({ page }) => {
        await page.selectOption('select[name="emotion"]', 'anxious');
        await page.fill('textarea[name="notes"]', 'Sentí ansiedad por la carga de trabajo.');
        await page.click('button[type="submit"]');

        const successMessage = await page.locator('.success'); 
        await expect(successMessage).toHaveText('Emoción registrada exitosamente');
    });
});
