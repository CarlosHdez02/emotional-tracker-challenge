import { test, expect } from '@playwright/test';

test.describe('Reminder Form Component', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/reminders');
    });

    test('should load the Reminder Form component', async ({ page }) => {
        const title = await page.locator('h2'); 
        await expect(title).toHaveText('Create Mental Health Reminder');
    });

    test('should fill out the form and verify values', async ({ page }) => {
        await page.fill('input[name="title"]', 'Morning Meditation');
        await page.fill('input[name="activity"]', 'Meditation');
        await page.selectOption('select[name="category"]', 'meditation');
        await page.fill('textarea[name="description"]', 'A relaxing morning meditation.');
        await page.selectOption('select[name="frequency"]', 'daily');

        // Verify entered values
        expect(await page.locator('input[name="title"]').inputValue()).toBe('Morning Meditation');
        expect(await page.locator('input[name="activity"]').inputValue()).toBe('Meditation');
        expect(await page.locator('textarea[name="description"]').inputValue()).toBe('A relaxing morning meditation.');
        expect(await page.locator('select[name="category"]').inputValue()).toBe('meditation');
        expect(await page.locator('select[name="frequency"]').inputValue()).toBe('daily');
    });

    test('should submit the form and show success message', async ({ page }) => {
        await page.fill('input[name="title"]', 'Morning Exercise');
        await page.fill('input[name="activity"]', 'Running');
        await page.selectOption('select[name="category"]', 'exercise');
        await page.fill('textarea[name="description"]', 'Jogging in the park.');
        await page.selectOption('select[name="frequency"]', 'weekly');

        await page.click('button[type="submit"]');

        const successMessage = await page.locator('.success');
        await expect(successMessage).toHaveText('Reminder created successfully');
    });

    test('should handle form submission error', async ({ page }) => {
       
        await page.route('**/api/reminders', route => route.abort());

        await page.fill('input[name="title"]', 'Test Reminder');
        await page.fill('input[name="activity"]', 'Testing');
        await page.click('button[type="submit"]');

        const errorMessage = await page.locator('.error');
        await expect(errorMessage).toHaveText('Error creating reminder');
    });

    test('should reset form after successful submission', async ({ page }) => {
        await page.fill('input[name="title"]', 'Yoga Session');
        await page.fill('input[name="activity"]', 'Yoga');
        await page.selectOption('select[name="category"]', 'meditation');
        await page.fill('textarea[name="description"]', 'Relaxing Yoga.');
        await page.selectOption('select[name="frequency"]', 'monthly');

        await page.click('button[type="submit"]');

        await page.waitForSelector('.success'); // Wait for success message

        // Ensure form is reset
        expect(await page.locator('input[name="title"]').inputValue()).toBe('');
        expect(await page.locator('input[name="activity"]').inputValue()).toBe('');
        expect(await page.locator('textarea[name="description"]').inputValue()).toBe('');
        expect(await page.locator('select[name="category"]').inputValue()).toBe('other');
        expect(await page.locator('select[name="frequency"]').inputValue()).toBe('once');
    });

});
