"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { getCells, getDistricts, getSectors, getVillages } from "@/app/actions/location";

type LocationOption = { id: string; name: string; code: string | null };

const selectClass =
  "mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm bg-white text-[#1c2b23] disabled:bg-[#f2f5f0] disabled:text-[#9db0a4]";

export function LocationPicker({ villageRequired = false }: { villageRequired?: boolean }) {
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [sectors, setSectors] = useState<LocationOption[]>([]);
  const [cells, setCells] = useState<LocationOption[]>([]);
  const [villages, setVillages] = useState<LocationOption[]>([]);

  const [districtId, setDistrictId] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [cellId, setCellId] = useState("");
  const [villageId, setVillageId] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      getDistricts().then(setDistricts).catch(() => setDistricts([]));
    });
  }, []);

  useEffect(() => {
    setSectorId("");
    setSectors([]);
    setCellId("");
    setCells([]);
    setVillageId("");
    setVillages([]);
    if (!districtId) return;
    startTransition(() => {
      getSectors(districtId).then(setSectors).catch(() => setSectors([]));
    });
  }, [districtId]);

  useEffect(() => {
    setCellId("");
    setCells([]);
    setVillageId("");
    setVillages([]);
    if (!sectorId) return;
    startTransition(() => {
      getCells(sectorId).then(setCells).catch(() => setCells([]));
    });
  }, [sectorId]);

  useEffect(() => {
    setVillageId("");
    setVillages([]);
    if (!cellId) return;
    startTransition(() => {
      getVillages(cellId).then(setVillages).catch(() => setVillages([]));
    });
  }, [cellId]);

  const districtName = useMemo(
    () => districts.find((item) => item.id === districtId)?.name ?? "",
    [districts, districtId]
  );
  const sectorName = useMemo(
    () => sectors.find((item) => item.id === sectorId)?.name ?? "",
    [sectors, sectorId]
  );
  const cellName = useMemo(
    () => cells.find((item) => item.id === cellId)?.name ?? "",
    [cells, cellId]
  );
  const villageName = useMemo(
    () => villages.find((item) => item.id === villageId)?.name ?? "",
    [villages, villageId]
  );

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
          onChange={(event) => setDistrictId(event.target.value)}
          className={selectClass}
        >
          <option value="">Select district</option>
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
          disabled={!districtId}
          value={sectorId}
          onChange={(event) => setSectorId(event.target.value)}
          className={selectClass}
        >
          <option value="">{districtId ? "Select sector" : "Select a district first"}</option>
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
          disabled={!sectorId}
          value={cellId}
          onChange={(event) => setCellId(event.target.value)}
          className={selectClass}
        >
          <option value="">{sectorId ? "Select cell" : "Select a sector first"}</option>
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
          disabled={!cellId}
          value={villageId}
          onChange={(event) => setVillageId(event.target.value)}
          className={selectClass}
        >
          <option value="">{cellId ? "Select village" : "Select a cell first"}</option>
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
