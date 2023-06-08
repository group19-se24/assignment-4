import { expect } from "@playwright/test"

import { test } from "~~/test/playwright/utils/test-fixture"

import {
  assertCheckboxStatus,
  currentContentType,
  filters,
  goToSearchTerm,
  searchTypeNames,
} from "~~/test/playwright/utils/navigation"

import breakpoints from "~~/test/playwright/utils/breakpoints"

import { ALL_MEDIA, AUDIO, IMAGE } from "~/constants/media"

/**
 * URL is correctly converted into search state:
 * 1. `q` parameter is set as the search input value
 * 2. /search/<path>?query - path is used to choose the content type
 * 3. query parameters are used to set the filter data:
 * 3a. One of each values for `all` content
 * 3b. Several query values - several filter checkboxes
 * 3c. Mature filter
 * 3d. Query parameters that are not used for current media type are discarded
 * All of these tests test server-generated search page, not the one generated on the client
 */

test.describe.configure({ mode: "parallel" })

test.describe("search query on SSR", () => {
  breakpoints.describeMobileAndDesktop(() => {
    test("q query parameter is set as the search term", async ({ page }) => {
      await goToSearchTerm(page, "cat", {
        query: "license=cc0&license_type=commercial&searchBy=creator",
      })

      const searchInput = page.locator('input[type="search"]')
      await expect(searchInput).toHaveValue("cat")
      // Todo: focus the input?
      // await expect(searchInput).toBeFocused()
    })

    test("url path /search/ is used to select `all` search tab", async ({
      page,
    }) => {
      await page.goto("/search/?q=cat")

      const contentType = await currentContentType(page)
      expect(contentType).toEqual(searchTypeNames.ltr[ALL_MEDIA])
    })

    test("url path /search/audio is used to select `audio` search tab", async ({
      page,
    }) => {
      const searchType = AUDIO
      await goToSearchTerm(page, "cat", { searchType })

      const contentType = await currentContentType(page)
      expect(contentType).toEqual(searchTypeNames.ltr[searchType])
    })

    test("url query to filter, all tab, one parameter per filter type", async ({
      page,
    }) => {
      await goToSearchTerm(page, "cat", {
        query: "license=cc0&license_type=commercial&searchBy=creator",
      })

      await filters.open(page)
      // Creator filter was removed from the UI
      for (const checkbox of ["cc0", "commercial"]) {
        await assertCheckboxStatus(page, checkbox)
      }
    })

    test("url query to filter, image tab, several filters for one filter type selected", async ({
      page,
    }) => {
      await goToSearchTerm(page, "cat", {
        searchType: IMAGE,
        query: "searchBy=creator&extension=jpg,png,gif,svg",
      })
      await filters.open(page)
      const checkboxes = ["JPEG", "PNG", "GIF", "SVG"]
      for (const checkbox of checkboxes) {
        await assertCheckboxStatus(page, checkbox)
      }
    })

    test.skip("url mature query is set, and can be unchecked using the Safer Browsing popup", async ({
      page,
    }) => {
      await goToSearchTerm(page, "cat", {
        searchType: IMAGE,
        query: "mature=true",
      })

      await page.click('button:has-text("Safer Browsing")')

      const matureCheckbox = await page.locator("text=Show Mature Content")
      await expect(matureCheckbox).toBeChecked()

      await page.click("text=Show Mature Content")
      await expect(page).toHaveURL("/search/image?q=cat")
    })
  })
})
