#!/usr/bin/env python3
"""Reduce Juan's local git history + public stats to data/history.json (the "Every commit" peak's data).

Run: npm run data   (or python3 scripts/build-history.py; HISTORY_OUT=<path> writes elsewhere)
It reads the owner's local repos, so it runs on his Mac before a deploy, never on the build server.
Output keys: series (one entry per day: {"d": "YYYY-MM-DD", <project id>: commits}), totals, total, first, last,
milestones, stats, races. Project ids: wsigte, atlas, ads, onerm, calautox, site (this website), other (unnamed side
projects, never named on the site) and next (the unannounced project: never name it anywhere public).
Sources: local repos in ~/workspace (author 'Juan Castillo', all branches, deduped by hash),
App Store lookup, npm registry/downloads, CalAutoX profile cached in ~/workspace/longdog-racing/data.
Projects not shown on the site are summed into 'other' without names. The secret game is 'next'.
"""
import json, subprocess, urllib.request, collections, os, datetime

WS = os.path.expanduser("~/workspace")
OUT = os.environ.get("HISTORY_OUT") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "history.json")

PROJECTS = {
    "wsigte": ["WSIGTE", "wsigte-server"],
    "atlas": ["Atlas"],
    "ads": ["AtlasDesignSystem"],
    "onerm": ["OneRM", "onerm-site"],
    "calautox": ["calautox"],
    "site": ["portfolio"],
}
# The unannounced project's repo names stay out of this public repo: they live in the
# gitignored scripts/history-sources.local.json as {"next": ["repo", ...]}.
_local = os.path.join(os.path.dirname(__file__), "history-sources.local.json")
if not os.path.exists(_local):
    raise SystemExit("missing scripts/history-sources.local.json (see README)")
PROJECTS["next"] = json.load(open(_local))["next"]
OTHER = ["ezBudget", "stashTok", "anki-cls-flashcards", "myods", "box-box", "autox-wiki",
         "longdog-racing", "juancastillom-analytics", "retro-console", "podcast-transcription",
         "proxmox-scripts", "app-release", "near-dup", "bank-dupe-review"]

def commits(repo):
    path = os.path.join(WS, repo)
    if not os.path.isdir(os.path.join(path, ".git")) and not os.path.isfile(os.path.join(path, ".git")):
        return []
    out = subprocess.run(["git", "-C", path, "log", "--all", "--author=Juan Castillo", "--format=%H %as"],
                         capture_output=True, text=True).stdout.split("\n")
    return [l.split() for l in out if l.strip()]

seen = set()
daily = collections.defaultdict(lambda: collections.Counter())  # date -> project -> n
totals = collections.Counter()
for pid, repos in list(PROJECTS.items()) + [("other", OTHER)]:
    for r in repos:
        for h, d in commits(r):
            if h in seen:
                continue
            seen.add(h)
            daily[d][pid] += 1
            totals[pid] += 1

days = sorted(daily)
series = [{"d": d, **dict(daily[d])} for d in days]

def get(url):
    with urllib.request.urlopen(url, timeout=20) as r:
        return json.load(r)

apps = {r["trackId"]: r for r in get("https://itunes.apple.com/lookup?id=6746527690,1538171180&country=us")["results"]}
npm = get("https://registry.npmjs.org/atlas-design-system")
dl = get("https://api.npmjs.org/downloads/range/2024-07-01:%s/atlas-design-system" % datetime.date.today().isoformat())
prof = json.load(open(os.path.join(WS, "longdog-racing/data/sfr-profile-82.json")))
races = json.load(open(os.path.join(WS, "longdog-racing/data/results.json")))

def first_commit(repos):
    ds = [d for r in repos for _, d in commits(r)]
    return min(ds) if ds else None

onerm, atlas = apps[6746527690], apps[1538171180]
data = {
    "generated": datetime.date.today().isoformat(),
    "totals": dict(totals),
    "total": sum(totals.values()),
    "first": days[0], "last": days[-1],
    "series": series,
    "milestones": [
        {"d": first_commit(["WSIGTE"]), "app": "wsigte", "label": "First commit on WSIGTE"},
        {"d": first_commit(["Atlas"]), "app": "atlas", "label": "First commit on Atlas"},
        {"d": atlas["releaseDate"][:10], "app": "atlas", "label": "Atlas on the App Store"},
        {"d": npm["time"]["created"][:10], "app": "ads", "label": "Atlas Design System on npm"},
        {"d": first_commit(["OneRM"]), "app": "onerm", "label": "First commit on OneRM"},
        {"d": onerm["releaseDate"][:10], "app": "onerm", "label": "OneRM on the App Store"},
        {"d": first_commit(["calautox"]), "app": "calautox", "label": "First commit on CalAutoX"},
        {"d": first_commit(PROJECTS["next"][:1]), "app": "next", "label": "Something new"},
    ],
    "stats": {
        "onerm": {"version": onerm["version"], "released": onerm["releaseDate"][:10], "updated": onerm.get("currentVersionReleaseDate", "")[:10], "rating": onerm.get("averageUserRating"), "ratings": onerm.get("userRatingCount")},
        "atlas": {"version": atlas["version"], "released": atlas["releaseDate"][:10], "updated": atlas.get("currentVersionReleaseDate", "")[:10], "rating": atlas.get("averageUserRating"), "ratings": atlas.get("userRatingCount")},
        "ads": {"versions": len(npm["versions"]), "latest": npm["dist-tags"]["latest"], "published": npm["time"]["created"][:10], "downloads": sum(x["downloads"] for x in dl["downloads"])},
        "autocross": {k: prof["career"][k] for k in ("events_attended", "total_runs", "clean_runs", "wins_class", "podiums_class", "first_season")},
    },
    "races": [{"d": e["date"], "cls": e["cls"], "clsN": e["clsN"]} for e in races["events"]],
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(data, open(OUT, "w"), separators=(",", ":"))
print("wrote", OUT, "days", len(days), "total", data["total"], dict(totals))
for m in data["milestones"]:
    print(m)
