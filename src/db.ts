import Dexie, { type EntityTable } from 'dexie';

// Definicja struktury zgłoszenia (To opiszesz w rozdziale 4)
export interface Issue {
  id?: number;
  plateNumber: string;
  description: string;
  photo?: Blob; // Tutaj będziemy trzymać zdjęcie z kamery
  date: Date;
  synced: boolean;
}

// Inicjalizacja bazy
const db = new Dexie('FleetDatabase') as Dexie & {
  issues: EntityTable<Issue, 'id'>;
};

// Schema bazy danych
db.version(1).stores({
  issues: '++id, date, synced' 
});

export { db };