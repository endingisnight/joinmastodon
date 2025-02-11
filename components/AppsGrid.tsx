import { FormattedMessage, useIntl } from "react-intl"
import { AppCard } from "../components/AppCard"
import { useState } from "react"
import SelectMenu from "../components/SelectMenu"
import { sortBy as _sortBy } from "lodash"
import type { app } from "../data/apps"
import Category from "../components/Category"

export type AppsGridProps = {
  apps: app[]
}

//prettier-ignore
export const categories = {
  all: "All",
  libre: "Libre",
  web: "Web",
  fdroid: "F-Droid",
  appimage: "AppImage",
  flatpak: "Flatpak",
  debian: "Debian",
  arch: "Arch",

  snap: "Snap",
  micestore: "Microsoft Store",
  windows: "Windows",
  gplay: "Google Play",
  ios: "iOS",
  macos: "MacOS",
  watchos: "WatchOS",
  retro: "Retro",
}

//prettier-ignore
export const sortOptions = {
  date_added: "Recently Added",
  paid: "Free",
  libre: "Libre",
  category: "Category",
  name: "Alphabetical",
}

/** Renders AppCards as a grid, with sorting and filtering options */
export const AppsGrid = ({ apps }: AppsGridProps) => {
  const intl = useIntl()
  const [activeCategory, setActiveCategory] = useState("all")

  Object.keys(categories).forEach(k => {
    // TODO this edits the global categories, if translations dont matter here then remove me.
    categories[k] = intl.formatMessage({ id: `browse_apps.${k}`, defaultMessage: categories[k] })
  })

  Object.keys(sortOptions).forEach(k =>
    sortOptions[k] = intl.formatMessage({ id: `sorting.${k}`, defaultMessage: sortOptions[k] })
  )

  // filter & sort apps
  const [sortOption, setSortOption] = useState(sortOptions[0])
  const filteredApps = activeCategory === "all" ? apps : apps.filter(
    app => app[activeCategory]
  )
  const sortedAndFilteredApps = _sortBy(filteredApps, sortOption)
    // prefer open source
    .sort((a, b) => {
      if (!a.source < !b.source) return -1;
      if (!a.source > !b.source) return 1;
      return 0;
    });

  return (
    <div>
      <div>
        <h2 className="h4 mb-8">
          <FormattedMessage
            id="browse_apps.title2"
            defaultMessage="Browse third-party apps"
          />
        </h2>
        <div className="-mx-gutter ps-gutter mb-6 overflow-x-auto">
          <div className="flex flex-wrap gap-gutter md:flex-nowrap">
            {Object.keys(categories)
              // remove categories that don't have atleast 3 apps
              .filter(k => {
                if (k !== 'all' && apps.filter(app => app[k]).length < 3) return false;
                return true;
              })
              .map((category) => (
                <Category
                  key={category}
                  value={category}
                  currentValue={activeCategory}
                  label={categories[category]}
                  onChange={(e) => setActiveCategory(e.target.value)}
                />
              ))}
          </div>
        </div>
      </div>
      <div className="my-8">
        <SelectMenu
          label={
            <FormattedMessage id="sorting.sort_by" defaultMessage="Sort" />
          }
          value={sortOption}
          onChange={(v) => {
            setSortOption(v)
          }}
          options={Object.keys(sortOptions).flatMap(x => ({ label: sortOptions[x], value: x }))}
        />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {sortedAndFilteredApps.map(app => AppCard(app, activeCategory))}
      </div>
    </div>
  )
}
export default AppsGrid
