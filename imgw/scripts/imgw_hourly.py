from __future__ import annotations

import argparse
import io
import zipfile
from datetime import date

import pandas as pd
import requests


BASE_URL = (
    "https://danepubliczne.imgw.pl/pl/datastore/getfiledown/Arch/Telemetria/Meteo/"
    "{yyyy}/Meteo_{yyyy}-{mm:02d}.zip"
)


def download_zip(yyyy: int, mm: int) -> bytes:
    url = BASE_URL.format(yyyy=yyyy, mm=mm)
    r = requests.get(url, timeout=180)
    r.raise_for_status()
    return r.content


def read_b00300s(zip_bytes: bytes, yyyy: int, mm: int) -> pd.DataFrame:
    want = f"B00300S_{yyyy}_{mm:02d}.csv"

    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
        candidates = [n for n in z.namelist() if n.endswith(want)]
        if not candidates:
            raise FileNotFoundError(
                f"Nie znaleziono {want} w ZIP. Przykładowe pliki: {z.namelist()[:20]}"
            )
        with z.open(candidates[0]) as f:
            # Twoje dane wyglądały jak: id<TAB>produkt<TAB>dd.mm.yyyy hh:mm<TAB>temp
            df = pd.read_csv(
                f,
                sep=None,
                engine="python",
                header=None,
                names=["station_id", "product", "dt", "temp"],
            )

    df["station_id"] = pd.to_numeric(df["station_id"], errors="coerce").astype("Int64")
    df["dt"] = pd.to_datetime(df["dt"], dayfirst=True, errors="coerce")
    df["temp"] = pd.to_numeric(df["temp"], errors="coerce")
    df = df.dropna(subset=["station_id", "dt", "temp"])
    return df


def hourly_mean_for_station(df_10min: pd.DataFrame, station_id: int) -> pd.DataFrame:
    d = df_10min[df_10min["station_id"] == station_id].copy()
    if d.empty:
        raise ValueError(
            f"Brak rekordów dla station_id={station_id} w tym miesiącu (albo inny typ pliku)."
        )
    d["hour"] = d["dt"].dt.floor("h")
    out = d.groupby("hour", as_index=False)["temp"].mean()
    out.rename(columns={"temp": "temp_mean"}, inplace=True)
    return out


def main():
    ap = argparse.ArgumentParser(description="IMGW: godzinowa średnia temperatury dla stacji")
    ap.add_argument("--station", type=int, required=True, help="station_id, np. 352200375")
    ap.add_argument("--year", type=int, required=True, help="rok, np. 2026")
    ap.add_argument("--month", type=int, required=True, help="miesiąc 1-12, np. 1")
    ap.add_argument(
        "--out",
        type=str,
        required=True,
        help='ścieżka wyjściowa, np. "imgw/data/hourly_352200375_2026-01.csv"',
    )
    args = ap.parse_args()

    zip_bytes = download_zip(args.year, args.month)
    df = read_b00300s(zip_bytes, args.year, args.month)
    hourly = hourly_mean_for_station(df, args.station)

    # format ISO w czasie lokalnym z pliku (tak jak w źródle)
    hourly["hour"] = hourly["hour"].dt.strftime("%Y-%m-%d %H:%M:%S")
    hourly.to_csv(args.out, index=False)
    print(f"OK: zapisano {args.out} (wierszy: {len(hourly)})")


if __name__ == "__main__":
    main()