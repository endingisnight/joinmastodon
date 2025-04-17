import { FormattedMessage, useIntl } from "react-intl"
import { AppCard } from "../components/AppCard"
import { useState } from "react"
import SelectMenu from "../components/SelectMenu"
import { sortBy as _sortBy } from "lodash"
import { type app } from "../data/apps"
import Category from "../components/Category"

export type AppsGridProps = {
  apps: app[]
}

export const devices = {
  all: {
    name: "All",
    stores: []
  },
  desktop: {
    name: "Desktop",
    stores: [
      "web",
      "firefox",
      "chrome",

      "appimage",
      "flatpak",
      "snap",
      "debian",
      "arch",
      "arch_aur",
      "rpm",

      "micestore",
      "windows",

      "maocos",
      "brew",
    ]
  },
  android: {
    name: "Android",
    stores: [
      "web",

      "fdroid",
      "izzy",
      "gplay",
      "android",
    ]
  },
  ios: {
    name: "iOS",
    stores: [
      "web",
      "ios",
    ]
  },
  retro: {
    name: "Retro",
    stores: [
      "retro",
    ]
  },
};
devices.all.stores = [].concat(...Object.values(devices).flatMap(x => x.stores))
  .filter((x, i, a) => a.indexOf(x) === i)

//prettier-ignore
export const stores = {
  all: "All",
  web: "Web",
  fdroid: "F-Droid",
  appimage: "AppImage",
  flatpak: "Flatpak",
  debian: "Debian",
  arch: "Arch",
  firefox: "Firefox",

  chrome: "Chrome",
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
  name: "Alphabetical",
  released_on: "Recently Added",
  source: "Libre",
  paid: "Paid",
}

/** Renders AppCards as a grid, with sorting and filtering options */
export const AppsGrid = ({ apps }: AppsGridProps) => {
  const intl = useIntl()
  const [selectedDevice, setDeviceCategory] = useState("all")
  const [sortOption, setSortOption] = useState(`source`);
  const [selectedStore, setStoreOption] = useState(`all`);

  Object.keys(stores).forEach(k => {
    // TODO this edits the global categories, if translations dont matter here then remove me.
    stores[k] = intl.formatMessage({ id: `browse_apps.${k}`, defaultMessage: stores[k] })
  })

  Object.keys(sortOptions).forEach(k =>
    sortOptions[k] = intl.formatMessage({ id: `sorting.${k}`, defaultMessage: sortOptions[k] })
  )

  // filter apps
  const filteredApps = selectedStore === "all"
    ? apps
    : apps
    // filter for devices
      .filter(
        app => devices[selectedDevice].stores.find(x => app[x])
      )
      .filter(
        app => app[selectedStore]
      )

  // sort apps
  filteredApps.sort((a, b) => {
    // normalize
    // when changing, be sure to check with each default sortOption since SSR can be a royal pain.
    // What renders for "name" wont work for "source".
    let A = a[sortOption] ?? ``;
    let B = b[sortOption] ?? ``;
    if (A?.getTime) A = A.getTime();
    if (B?.getTime) B = B.getTime();
    if (typeof A === `string`) A = A.toLowerCase();
    if (typeof B === `string`) B = B.toLowerCase();

    if (sortOption === `name`) {
      if (A < B) return -1;
      if (A > B) return 1;
      return 0;
    }
    if (A > B) return -1;
    if (A < B) return 1;
    return 0;
  })
  //console.debug(sortOption, filteredApps.flatMap(x => x[sortOption]));

  return (
    <div>
      <div>
        <div className="mb-8">
          <h2 className="h4">
            <FormattedMessage
              id="browse_apps.title2"
              defaultMessage="Browse third-party apps"
            />
          </h2>
        </div>
        <div className="-mx-gutter ps-gutter mb-6 overflow-x-auto">
          <div className="flex flex-wrap gap-gutter md:flex-nowrap">
            {Object.keys(devices)
              // remove categories that don't have atleast 3 apps
              //.filter(k => {
              //  if (k !== 'all' && apps.filter(app => app[k]).length < 3) return false;
              //  return true;
              //})
              .map(device => (
                <Category
                  key={device}
                  value={device}
                  currentValue={selectedDevice}
                  label={devices[device].name}
                  onChange={(e) => setDeviceCategory(e.target.value)}
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
          onChange={setSortOption}
          options={Object.keys(sortOptions).flatMap(x => ({ label: sortOptions[x], value: x }))}
        />
        <SelectMenu
          label={
            <FormattedMessage id="filtering.stores" defaultMessage="Platform" />
          }
          value={selectedStore}
          onChange={setStoreOption}
          options={Object.keys(stores)
            // filter stores by platform
            .filter(x => devices[selectedDevice].stores.includes(x))
            .flatMap(x => ({ label: stores[x], value: x }))}
        />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {filteredApps.map(app => AppCard(app, selectedStore))}
      </div>
    </div>
  )
}
export default AppsGrid
