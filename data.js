'use strict';

const BASE_ESSENTIALS = [
  {
    id: 'dokumente', icon: '📄', name: 'Dokumente & Tickets',
    items: [
      { id: 'basis_reisepass', text: 'Personalausweis / Reisepass' },
      { id: 'basis_fuehrerschein', text: 'Führerschein' },
      { id: 'basis_ecard', text: 'Krankenversicherungskarte (e-card)' },
      { id: 'basis_kreditkarte', text: 'Kreditkarte / Bankomatkarte' },
      { id: 'basis_bargeld', text: 'Bargeld (lokale Währung)' },
      { id: 'basis_tickets', text: 'Race-Tickets (digital oder ausgedruckt)' },
      { id: 'basis_hotel', text: 'Hotel-/Unterkunfts-Bestätigung' },
      { id: 'basis_notfall', text: 'Nothilfe-Nummern notiert' },
    ]
  },
  {
    id: 'kleidung', icon: '👗', name: 'Kleidung',
    items: [
      { id: 'basis_hospitality_outfit', text: 'Hospitality-/Event-Outfit (1–2x)' },
      { id: 'basis_track_outfit', text: 'Lässiges Rennstrecken-Outfit (1–2x)' },
      { id: 'basis_abend_outfit', text: 'Abend-Outfit' },
      { id: 'basis_unterwaesche', text: 'Unterwäsche (Anzahl Nächte + 1)' },
      { id: 'basis_socken', text: 'Socken (Anzahl Nächte + 1)' },
      { id: 'basis_schlafanzug', text: 'Schlafanzug / Pyjama' },
      { id: 'basis_sport_schuhe', text: 'Sportliche Schuhe / bequeme Schuhe' },
      { id: 'basis_abend_schuhe', text: 'Abendschuhe / elegante Schuhe' },
      { id: 'basis_jacke', text: 'Leichte Jacke / Windbreaker' },
      { id: 'basis_regenjacke', text: 'Regenjacke oder Poncho' },
      { id: 'basis_hut', text: 'Sonnenhut oder Kappe' },
    ]
  },
  {
    id: 'technik', icon: '💻', name: 'Technik & Gadgets',
    items: [
      { id: 'basis_handy', text: 'Handy + Ladekabel' },
      { id: 'basis_powerbank', text: 'Powerbank' },
      { id: 'basis_kopfhoerer', text: 'Kopfhörer' },
      { id: 'basis_laptop', text: 'Laptop (wenn nötig)' },
      { id: 'basis_adapter', text: 'Adapter / Universal-Stecker' },
      { id: 'basis_esim', text: 'Airalo eSIM aktiviert' },
      { id: 'basis_kamera', text: 'Kamera + Speicherkarte + Ladekabel' },
      { id: 'basis_ohrenstoepsel_tech', text: 'Ohrstöpsel (Rennstrecke!)' },
    ]
  },
  {
    id: 'race_gear', icon: '🏎️', name: 'Race Gear',
    items: [
      { id: 'basis_gehoerschutz', text: 'Ohrstöpsel / Gehörschutz' },
      { id: 'basis_fernglas', text: 'Fernglas' },
      { id: 'basis_race_app', text: 'F1/Race-App auf Handy (Live Timing)' },
      { id: 'basis_sonnencreme', text: 'Sonnencreme (hoch LSF)' },
      { id: 'basis_sonnenbrille', text: 'Sonnenbrille' },
      { id: 'basis_rucksack', text: 'Kleiner Rucksack / Tasche für die Strecke' },
    ]
  },
  {
    id: 'kosmetik', icon: '💄', name: 'Kosmetik & Pflege',
    items: [
      { id: 'basis_zahnbuerste', text: 'Zahnbürste + Zahnpasta' },
      { id: 'basis_deo', text: 'Deo' },
      { id: 'basis_duschgel', text: 'Duschgel / Shampoo' },
      { id: 'basis_kerastase', text: 'Kérastase Ciment Thermique' },
      { id: 'basis_dyson', text: 'Haarstyling (Dyson Airwrap Adapter!)' },
      { id: 'basis_gesicht', text: 'Gesichtspflege (Tages- & Nachtcreme)' },
      { id: 'basis_makeup', text: 'Make-up Basics' },
      { id: 'basis_rasierer', text: 'Rasierer' },
      { id: 'basis_schmerzmittel', text: 'Schmerzmittel / Erste Hilfe' },
      { id: 'basis_medikamente', text: 'Persönliche Medikamente' },
    ]
  },
  {
    id: 'reise', icon: '🏨', name: 'Reise & Unterkunft',
    items: [
      { id: 'basis_unterkunft', text: 'Unterkunft bestätigt und gespeichert' },
      { id: 'basis_checkin', text: 'Check-in Zeit bekannt' },
      { id: 'basis_parking', text: 'Parkinformation (bei Auto-Reisen)' },
      { id: 'basis_maps', text: 'Google Maps Offline-Karte heruntergeladen' },
      { id: 'basis_kontakte', text: 'Notfall-Kontakte gespeichert' },
    ]
  },
  {
    id: 'diverses', icon: '🎒', name: 'Diverses',
    items: [
      { id: 'basis_wasserflasche', text: 'Wiederverwendbare Wasserflasche' },
      { id: 'basis_snacks', text: 'Snacks für Anreise' },
      { id: 'basis_einkaufstasche', text: 'Kleine Einkaufstasche' },
      { id: 'basis_schloss', text: 'Schloss für Gepäck' },
      { id: 'basis_reisekissen', text: 'Reisekissen (lange Autofahrten)' },
    ]
  },
];

const EVENTS = [
  {
    id: 'brno',
    name: 'Brno MotoGP',
    flag: '🇨🇿',
    dates: '19.–21.06.2026',
    hotel: 'Courtyard by Marriott Brno',
    transport: 'Auto',
    hospitality: 'Local Hospitality VIP Turn 1',
    extras: [
      {
        categoryId: 'dokumente', icon: '📄', name: 'Dokumente & Tickets',
        items: [{ id: 'brno_vip_ticket', text: 'MotoGP-Tickets / VIP-Zugang Turn 1' }]
      },
      {
        categoryId: 'kleidung', icon: '👗', name: 'Kleidung',
        items: [
          { id: 'brno_bequeme_schuhe', text: 'Bequeme Schuhe (viel Laufen)' },
          { id: 'brno_abend_jacke', text: 'Leichte Jacke (Abend)' },
        ]
      },
      {
        categoryId: 'race_gear', icon: '🏎️', name: 'Race Gear',
        items: [{ id: 'brno_programm', text: 'MotoGP-Programm / Zeitplan' }]
      },
      {
        categoryId: 'diverses', icon: '🎒', name: 'Diverses',
        items: [{ id: 'brno_bar_outfit', text: 'Bar-Outfit einplanen (Super Panda Circus Speakeasy — Fr/Sa Abend)' }]
      },
    ]
  },
  {
    id: 'austria',
    name: 'Austrian Grand Prix',
    flag: '🇦🇹',
    dates: '26.–28.06.2026',
    hotel: 'Airbnb Spielberg',
    transport: 'Auto (von Brno)',
    hospitality: 'Porsche Supercup Hospitality',
    extras: [
      {
        categoryId: 'dokumente', icon: '📄', name: 'Dokumente & Tickets',
        items: [
          { id: 'austria_f1_tickets', text: 'F1-Tickets' },
          { id: 'austria_porsche_pass', text: 'Porsche Supercup Hospitality-Pass' },
        ]
      },
      {
        categoryId: 'kleidung', icon: '👗', name: 'Kleidung',
        items: [
          { id: 'austria_hospitality_outfit', text: 'Hospitality-Outfit (smart casual)' },
          { id: 'austria_sonnenschutz', text: 'Sonnenschutz-Outfit' },
          { id: 'austria_regenjacke', text: 'Regenjacke (Bergwetter)' },
        ]
      },
      {
        categoryId: 'race_gear', icon: '🏎️', name: 'Race Gear',
        items: [{ id: 'austria_porsche_programm', text: 'Porsche Supercup Programm' }]
      },
      {
        categoryId: 'diverses', icon: '🎒', name: 'Diverses',
        items: [
          { id: 'austria_perschler', text: 'Eleganteres Outfit (Do-Abend: Restaurant Perschler mit Jean Michel & Benjamin)' },
          { id: 'austria_gepackt', text: 'Direkt nach Brno — bereits im Auto gepackt ✓' },
        ]
      },
    ]
  },
  {
    id: 'norisring',
    name: 'Norisring – DTM & Porsche',
    flag: '🇩🇪',
    dates: '03.–05.07.2026',
    hotel: 'Sheraton Carlton Hotel Nürnberg',
    transport: 'Auto',
    hospitality: 'Sa: Porsche Hospitality / So: Grandstand',
    extras: [
      {
        categoryId: 'dokumente', icon: '📄', name: 'Dokumente & Tickets',
        items: [
          { id: 'noris_dtm_tickets', text: 'DTM-Tickets' },
          { id: 'noris_porsche_pass', text: 'Porsche Carrera Cup Hospitality-Pass (Samstag)' },
        ]
      },
      {
        categoryId: 'kleidung', icon: '👗', name: 'Kleidung',
        items: [
          { id: 'noris_hospitality_outfit', text: 'Hospitality-Outfit (Samstag)' },
          { id: 'noris_grandstand_outfit', text: 'Lässigeres Outfit (Sonntag Grandstand)' },
          { id: 'noris_see_outfit', text: 'Outfit für See-Abend am Tegernsee (Sonntag)' },
        ]
      },
      {
        categoryId: 'diverses', icon: '🎒', name: 'Diverses',
        items: [
          { id: 'noris_dinner_benjamin', text: 'Sa Abend: ggf. Dinner mit Benjamin' },
          { id: 'noris_tegernsee', text: 'So Abend: Fahrt zum Tegernsee → AK CARO & SELIG' },
          { id: 'noris_abreise', text: 'Mo: Karin Zug Innsbruck → Wien, David fährt nach Cittadella' },
        ]
      },
    ]
  },
  {
    id: 'hungary',
    name: 'Hungarian Grand Prix',
    flag: '🇭🇺',
    dates: '24.–26.07.2026',
    hotel: 'Airbnb Budapest',
    transport: 'Auto',
    hospitality: 'Porsche Supercup Hospitality',
    extras: [
      {
        categoryId: 'dokumente', icon: '📄', name: 'Dokumente & Tickets',
        items: [
          { id: 'hungary_f1_tickets', text: 'F1-Tickets' },
          { id: 'hungary_porsche_pass', text: 'Porsche Supercup Hospitality-Pass' },
        ]
      },
      {
        categoryId: 'kleidung', icon: '👗', name: 'Kleidung',
        items: [
          { id: 'hungary_hospitality_outfit', text: 'Hospitality-Outfit' },
          { id: 'hungary_sommerkleid', text: 'Sommerkleid (Budapest ist heiß im Juli!)' },
        ]
      },
      {
        categoryId: 'race_gear', icon: '🏎️', name: 'Race Gear',
        items: [
          { id: 'hungary_sonnencreme_extra', text: 'Extra Sonnencreme (Hitzeschutz)' },
          { id: 'hungary_faecher', text: 'Fächer' },
          { id: 'hungary_kuehlspray', text: 'Kühlspray' },
        ]
      },
      {
        categoryId: 'diverses', icon: '🎒', name: 'Diverses',
        items: [
          { id: 'hungary_abend_outfit', text: 'Sa Abend: Drinks (optional) → Abend-Outfit' },
          { id: 'hungary_spielberg', text: 'Nach dem Rennen: Weiterfahrt nach Spielberg → Schönberghof Red Bull Ring' },
          { id: 'hungary_ktm', text: 'Di: David KTM X-Bow Track Day' },
        ]
      },
    ]
  },
  {
    id: 'zandvoort',
    name: 'Dutch Grand Prix',
    flag: '🇳🇱',
    dates: '21.–23.08.2026',
    hotel: 'Hotel Amsterdam',
    transport: 'Flug',
    hospitality: 'Porsche Supercup Hospitality',
    note: 'Letzter GP in Zandvoort — historisches Wochenende!',
    extras: [
      {
        categoryId: 'dokumente', icon: '📄', name: 'Dokumente & Tickets',
        items: [
          { id: 'zandvoort_flugtickets', text: 'Flugtickets' },
          { id: 'zandvoort_f1_tickets', text: 'F1-Tickets' },
          { id: 'zandvoort_porsche_pass', text: 'Porsche Supercup Hospitality-Pass' },
          { id: 'zandvoort_reisepass', text: '⚠️ Reisepass / Personalausweis (Flug!)' },
        ]
      },
      {
        categoryId: 'kleidung', icon: '👗', name: 'Kleidung',
        items: [
          { id: 'zandvoort_hospitality_outfit', text: 'Hospitality-Outfit' },
          { id: 'zandvoort_windjacke', text: 'Windabweisende Jacke (Küste!)' },
          { id: 'zandvoort_bequeme_schuhe', text: 'Bequeme Schuhe (Amsterdam Sightseeing)' },
        ]
      },
      {
        categoryId: 'race_gear', icon: '🏎️', name: 'Race Gear',
        items: [
          { id: 'zandvoort_sonnencreme', text: 'Sonnencreme extra (Strandlage Zandvoort)' },
          { id: 'zandvoort_hut', text: 'Hut (Strand / Strecke)' },
        ]
      },
      {
        categoryId: 'diverses', icon: '🎒', name: 'Diverses',
        items: [
          { id: 'zandvoort_amsterdam', text: 'Mo: Amsterdam entdecken — Museen, Kanäle, Mittagessen' },
          { id: 'zandvoort_fruehflug', text: 'Di: Frühflug → Abend vorher schon packen!' },
          { id: 'zandvoort_sprint', text: 'Sprint Weekend — dichteres Programm, früher vor Ort sein' },
        ]
      },
    ]
  },
  {
    id: 'monza',
    name: 'Italian Grand Prix',
    flag: '🇮🇹',
    dates: '04.–06.09.2026',
    hotel: 'Apartment Mailand',
    transport: 'Karin fliegt / David Auto',
    hospitality: 'Porsche Supercup Hospitality',
    extras: [
      {
        categoryId: 'dokumente', icon: '📄', name: 'Dokumente & Tickets',
        items: [
          { id: 'monza_flugtickets', text: 'Flugtickets Wien → Mailand' },
          { id: 'monza_f1_tickets', text: 'F1-Tickets' },
          { id: 'monza_porsche_pass', text: 'Porsche Supercup Hospitality-Pass' },
          { id: 'monza_reisepass', text: '⚠️ Reisepass / Personalausweis (Flug!)' },
        ]
      },
      {
        categoryId: 'kleidung', icon: '👗', name: 'Kleidung',
        items: [
          { id: 'monza_hospitality_outfit', text: 'Hospitality-Outfit' },
          { id: 'monza_italiano_chic', text: 'Italiano-chic für Mailand-Abende' },
          { id: 'monza_algarve_koffer', text: '⚠️ Algarve-Koffer SEPARAT packen! (Badezeug, Sommerkleidung, Strandtasche)' },
        ]
      },
      {
        categoryId: 'diverses', icon: '🎒', name: 'Diverses',
        items: [
          { id: 'monza_pizza_dinner', text: 'Do Abend: Pizza-Dinner mit Mark, Jean Michel & Benjamin' },
          { id: 'monza_gruppenessen', text: 'Sa: ggf. nochmal Gruppenessen' },
          { id: 'monza_algarve_flug', text: '✈️ Nach Rennen: Flug Mailand → Faro → W Hotel Algarve (bis Do)' },
        ]
      },
    ]
  },
  {
    id: 'madrid',
    name: 'Madrid Grand Prix',
    flag: '🇪🇸',
    dates: '11.–13.09.2026',
    hotel: 'Airbnb Madrid (zentral)',
    transport: 'Flug von Faro',
    hospitality: 'La Azotea Hospitality @ Madring',
    note: 'Weltpremiere — erster Madrid GP der Geschichte!',
    extras: [
      {
        categoryId: 'dokumente', icon: '📄', name: 'Dokumente & Tickets',
        items: [
          { id: 'madrid_flugtickets', text: 'Flugtickets Faro → Madrid' },
          { id: 'madrid_f1_tickets', text: 'F1-Tickets' },
          { id: 'madrid_azotea_pass', text: 'La Azotea Hospitality-Pass' },
          { id: 'madrid_reisepass', text: '⚠️ Reisepass / Personalausweis (Flug!)' },
        ]
      },
      {
        categoryId: 'kleidung', icon: '👗', name: 'Kleidung',
        items: [
          { id: 'madrid_azotea_outfit', text: 'La Azotea Hospitality → elegantes Outfit (Rooftop-Bar-Feeling!)' },
          { id: 'madrid_abendgarderobe', text: 'Leichte Abendgarderobe (Madrid warm im September)' },
          { id: 'madrid_koffer_sortieren', text: '⚠️ Koffer enthält noch Algarve-Sachen → neu sortieren vor Abflug!' },
        ]
      },
      {
        categoryId: 'diverses', icon: '🎒', name: 'Diverses',
        items: [
          { id: 'madrid_couples_day', text: 'Fr: Couples-Day mit Tom & Kris' },
          { id: 'madrid_gruppe', text: 'Volles Wochenende mit Tom, Kris & John' },
          { id: 'madrid_heimflug', text: 'Mo: alle fliegen vom selben Flughafen heim' },
        ]
      },
    ]
  },
];
