"use client";

import { useEffect, useMemo, useState } from "react";
import { getCells, getDistricts, getSectors, getVillages } from "@/app/actions/location";

type LocationOption = { id: string; name: string; code: string | null };

export interface LocationChangeData {
  districtId: string;
  districtName: string;
  sectorId: string;
  sectorName: string;
  cellId: string;
  cellName: string;
  villageId: string;
  villageName: string;
}

const selectClass =
  "mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm bg-white text-[#1c2b23] disabled:bg-[#f2f5f0] disabled:text-[#9db0a4] transition-colors";

export function LocationPicker({
  villageRequired = false,
  initialDistrictId = "",
  initialSectorId = "",
  initialCellId = "",
  initialVillageId = "",
  initialDistrictName = "",
  initialSectorName = "",
  initialCellName = "",
  initialVillageName = "",
  onChange,
}: {
  villageRequired?: boolean;
  initialDistrictId?: string;
  initialSectorId?: string;
  initialCellId?: string;
  initialVillageId?: string;
  initialDistrictName?: string;
  initialSectorName?: string;
  initialCellName?: string;
  initialVillageName?: string;
  onChange?: (data: LocationChangeData) => void;
}) {
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [sectors, setSectors] = useState<LocationOption[]>([]);
  const [cells, setCells] = useState<LocationOption[]>([]);
  const [villages, setVillages] = useState<LocationOption[]>([]);

  const [districtId, setDistrictId] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [cellId, setCellId] = useState("");
  const [villageId, setVillageId] = useState("");

  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [loadingCells, setLoadingCells] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Load districts on mount
  useEffect(() => {
    let active = true;
    setLoadingDistricts(true);
    getDistricts()
      .then((data) => {
        if (!active) return;
        setDistricts(data);
      })
      .catch((err) => {
        console.error("Failed to load districts:", err);
        if (active) setDistricts([]);
      })
      .finally(() => {
        if (active) setLoadingDistricts(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Sync initial values when props change
  useEffect(() => {
    let active = true;
    const targetDistrict = initialDistrictId || initialDistrictName;
    if (!targetDistrict) {
      setDistrictId("");
      setSectorId("");
      setCellId("");
      setVillageId("");
      setSectors([]);
      setCells([]);
      setVillages([]);
      return;
    }

    // Determine district id/code
    const matchDistrict = districts.find(
      (d) =>
        d.id === targetDistrict ||
        d.code === targetDistrict ||
        d.name.toLowerCase() === targetDistrict.toLowerCase()
    );
    const resolvedDistId = matchDistrict ? matchDistrict.id : targetDistrict;

    setDistrictId(resolvedDistId);
    setLoadingSectors(true);

    getSectors(resolvedDistId)
      .then((loadedSectors) => {
        if (!active) return;
        setSectors(loadedSectors);
        setLoadingSectors(false);

        const targetSector = initialSectorId || initialSectorName;
        if (!targetSector) {
          setSectorId("");
          setCellId("");
          setVillageId("");
          setCells([]);
          setVillages([]);
          return;
        }

        const matchSector = loadedSectors.find(
          (s) =>
            s.id === targetSector ||
            s.code === targetSector ||
            s.name.toLowerCase() === targetSector.toLowerCase()
        );
        const resolvedSecId = matchSector ? matchSector.id : targetSector;

        setSectorId(resolvedSecId);
        setLoadingCells(true);

        return getCells(resolvedSecId).then((loadedCells) => {
          if (!active) return;
          setCells(loadedCells);
          setLoadingCells(false);

          const targetCell = initialCellId || initialCellName;
          if (!targetCell) {
            setCellId("");
            setVillageId("");
            setVillages([]);
            return;
          }

          const matchCell = loadedCells.find(
            (c) =>
              c.id === targetCell ||
              c.code === targetCell ||
              c.name.toLowerCase() === targetCell.toLowerCase()
          );
          const resolvedCId = matchCell ? matchCell.id : targetCell;

          setCellId(resolvedCId);
          setLoadingVillages(true);

          return getVillages(resolvedCId).then((loadedVillages) => {
            if (!active) return;
            setVillages(loadedVillages);
            setLoadingVillages(false);

            const targetVillage = initialVillageId || initialVillageName;
            if (targetVillage) {
              const matchVillage = loadedVillages.find(
                (v) =>
                  v.id === targetVillage ||
                  v.code === targetVillage ||
                  v.name.toLowerCase() === targetVillage.toLowerCase()
              );
              setVillageId(matchVillage ? matchVillage.id : targetVillage);
            }
          });
        });
      })
      .catch((err) => {
        console.error("Failed to sync initial location:", err);
      })
      .finally(() => {
        if (active) {
          setLoadingSectors(false);
          setLoadingCells(false);
          setLoadingVillages(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    districts,
    initialDistrictId,
    initialDistrictName,
    initialSectorId,
    initialSectorName,
    initialCellId,
    initialCellName,
    initialVillageId,
    initialVillageName,
  ]);

  const handleDistrictChange = (newDistrictId: string) => {
    setDistrictId(newDistrictId);
    setSectorId("");
    setCellId("");
    setVillageId("");
    setSectors([]);
    setCells([]);
    setVillages([]);

    if (!newDistrictId) return;

    setLoadingSectors(true);
    getSectors(newDistrictId)
      .then((data) => {
        setSectors(data);
      })
      .catch((err) => {
        console.error("Failed to load sectors:", err);
        setSectors([]);
      })
      .finally(() => {
        setLoadingSectors(false);
      });
  };

  const handleSectorChange = (newSectorId: string) => {
    setSectorId(newSectorId);
    setCellId("");
    setVillageId("");
    setCells([]);
    setVillages([]);

    if (!newSectorId) return;

    setLoadingCells(true);
    getCells(newSectorId)
      .then((data) => {
        setCells(data);
      })
      .catch((err) => {
        console.error("Failed to load cells:", err);
        setCells([]);
      })
      .finally(() => {
        setLoadingCells(false);
      });
  };

  const handleCellChange = (newCellId: string) => {
    setCellId(newCellId);
    setVillageId("");
    setVillages([]);

    if (!newCellId) return;

    setLoadingVillages(true);
    getVillages(newCellId)
      .then((data) => {
        setVillages(data);
      })
      .catch((err) => {
        console.error("Failed to load villages:", err);
        setVillages([]);
      })
      .finally(() => {
        setLoadingVillages(false);
      });
  };

  const handleVillageChange = (newVillageId: string) => {
    setVillageId(newVillageId);
  };

  const districtName = useMemo(() => {
    return districts.find((d) => d.id === districtId || d.code === districtId)?.name ?? "";
  }, [districts, districtId]);

  const sectorName = useMemo(() => {
    return sectors.find((s) => s.id === sectorId || s.code === sectorId)?.name ?? "";
  }, [sectors, sectorId]);

  const cellName = useMemo(() => {
    return cells.find((c) => c.id === cellId || c.code === cellId)?.name ?? "";
  }, [cells, cellId]);

  const villageName = useMemo(() => {
    return villages.find((v) => v.id === villageId || v.code === villageId)?.name ?? "";
  }, [villages, villageId]);

  // Notify onChange if callback is provided
  useEffect(() => {
    if (onChange) {
      onChange({
        districtId,
        districtName,
        sectorId,
        sectorName,
        cellId,
        cellName,
        villageId,
        villageName,
      });
    }
  }, [districtId, districtName, sectorId, sectorName, cellId, cellName, villageId, villageName, onChange]);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <input type="hidden" name="district" value={districtName} />
      <input type="hidden" name="sector" value={sectorName} />
      <input type="hidden" name="cell" value={cellName} />
      <input type="hidden" name="village" value={villageName} />
      <input type="hidden" name="districtId" value={districtId} />
      <input type="hidden" name="sectorId" value={sectorId} />
      <input type="hidden" name="cellId" value={cellId} />
      <input type="hidden" name="villageId" value={villageId} />

      <div>
        <label htmlFor="districtSelect" className="block text-sm font-medium text-[#5d6e64]">
          District
        </label>
        <select
          id="districtSelect"
          required
          value={districtId}
          disabled={loadingDistricts}
          onChange={(event) => handleDistrictChange(event.target.value)}
          className={selectClass}
        >
          <option value="">{loadingDistricts ? "Loading districts..." : "Select district"}</option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="sectorSelect" className="block text-sm font-medium text-[#5d6e64]">
          Sector
        </label>
        <select
          id="sectorSelect"
          required
          disabled={!districtId || loadingSectors}
          value={sectorId}
          onChange={(event) => handleSectorChange(event.target.value)}
          className={selectClass}
        >
          <option value="">
            {!districtId
              ? "Select a district first"
              : loadingSectors
                ? "Loading sectors..."
                : "Select sector"}
          </option>
          {sectors.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cellSelect" className="block text-sm font-medium text-[#5d6e64]">
          Cell
        </label>
        <select
          id="cellSelect"
          required
          disabled={!sectorId || loadingCells}
          value={cellId}
          onChange={(event) => handleCellChange(event.target.value)}
          className={selectClass}
        >
          <option value="">
            {!sectorId
              ? "Select a sector first"
              : loadingCells
                ? "Loading cells..."
                : "Select cell"}
          </option>
          {cells.map((cell) => (
            <option key={cell.id} value={cell.id}>
              {cell.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="villageSelect" className="block text-sm font-medium text-[#5d6e64]">
          Village {villageRequired ? "" : "(Optional)"}
        </label>
        <select
          id="villageSelect"
          required={villageRequired}
          disabled={!cellId || loadingVillages}
          value={villageId}
          onChange={(event) => handleVillageChange(event.target.value)}
          className={selectClass}
        >
          <option value="">
            {!cellId
              ? "Select a cell first"
              : loadingVillages
                ? "Loading villages..."
                : "Select village"}
          </option>
          {villages.map((village) => (
            <option key={village.id} value={village.id}>
              {village.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
