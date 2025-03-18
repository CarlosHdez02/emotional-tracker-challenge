import { test, expect } from '@playwright/test';

test.describe('Reminder List Component', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/reminders');
    });

    test('should load the Reminder List component', async ({ page }) => {
        const title = await page.locator('h2'); 
        await expect(title).toHaveText('Your Reminders');
    });

    test('should show a loading message while fetching reminders', async ({ page }) => {
        await page.waitForSelector('text=Loading reminders...');
        const loadingText = await page.locator('text=Loading reminders...').textContent();
        expect(loadingText).toContain('Loading reminders...');
    });

    test('should display an error message if fetching reminders fails', async ({ page }) => {
       
        await page.route('**/api/reminders', route => route.abort());

        await page.reload();
        await page.waitForSelector('.EmptyState');

        const errorText = await page.locator('.EmptyState').textContent();
        expect(errorText).toContain('Error loading reminders');
    });

    test('should show empty state when there are no reminders', async ({ page }) => {
        await page.waitForSelector('.EmptyState');
        const emptyText = await page.locator('.EmptyState').textContent();
        expect(emptyText).toContain('No reminders yet.');
    });

    test('should display a list of reminders', async ({ page }) => {
        await page.waitForSelector('.RemindersList');
        
        const reminders = await page.locator('.ReminderCard');
        expect(await reminders.count()).toBeGreaterThan(0); 
    });

    test('should toggle reminder status when clicked', async ({ page }) => {
        await page.waitForSelector('.ReminderCard');

        const firstReminder = await page.locator('.ReminderCard').first();
        const toggleButton = await firstReminder.locator('button');

        const initialText = await toggleButton.textContent();

        await toggleButton.click();
        await page.waitForTimeout(1000);

        const updatedText = await toggleButton.textContent();
        expect(updatedText).not.toBe(initialText); 
    });

    test('should display the category badge and scheduled time', async ({ page }) => {
        await page.waitForSelector('.ReminderCard');

        const categoryBadge = await page.locator('.CategoryBadge').first();
        const reminderTime = await page.locator('.ReminderTime').first();

        await expect(categoryBadge).toBeVisible();
        await expect(reminderTime).toBeVisible();
    });

});
