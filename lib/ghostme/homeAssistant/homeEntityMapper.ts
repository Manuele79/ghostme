export type HouseRoom =
  | "salotto"
  | "scale"
  | "cucina"
  | "camera"
  | "armadio"
  | "bagno"
  | "fuori_casa";

export type EntityInfo = {
  room?: HouseRoom;
  type:
    | "presence"
    | "motion"
    | "lux"
    | "light"
    | "switch"
    | "tv"
    | "phone"
    | "weather"
    | "sun"
    | "temperature"
    | "climate"
    | "automation"
    | "other";
  person?: "manu" | "vale";
};

const ENTITY_MAP: Record<string, EntityInfo> = {
  // SALOTTO
  "binary_sensor.movimento_sala_occupazione": { room: "salotto", type: "motion" },
  "light.lampadario_sala": { room: "salotto", type: "light" },
  "switch.lampada_salotto": { room: "salotto", type: "switch" },

  // quando arrivano / se esistono, metti i nomi reali
  "binary_sensor.presenza_salotto": { room: "salotto", type: "presence" },
  "sensor.luminosita_salotto": { room: "salotto", type: "lux" },

  // SCALE
  "binary_sensor.movimento_scale_occupazione": { room: "scale", type: "motion" },
  "light.striscia_led_scale": { room: "scale", type: "light" },

  // CUCINA
  "binary_sensor.movimento_cucina_occupazione": { room: "cucina", type: "motion" },
  "binary_sensor.smart_presence_sensor_occupazione": { room: "cucina", type: "presence" },
  "sensor.smart_presence_sensor_illuminamento": { room: "cucina", type: "lux" },
  "light.lampadario_cucina": { room: "cucina", type: "light" },
  "switch.luce_lavandino": { room: "cucina", type: "switch" },
  "media_player.lg_webos_tv_uk6200pla": { room: "cucina", type: "tv" },

  // CAMERA
  "binary_sensor.movimento_camera_manu_occupazione": { room: "camera", type: "motion" },
  "light.lampadario_camera": { room: "camera", type: "light" },
  "light.lampada_manu": { room: "camera", type: "light" },
  "light.lampada_vale": { room: "camera", type: "light" },
  "media_player.hisense_43a5fe_dal10537_airplay": { room: "camera", type: "tv" },

  // ARMADIO
  "binary_sensor.movimento_armadio_occupazione": { room: "armadio", type: "motion" },
  "light.striscia_led_armadio": { room: "armadio", type: "light" },
  "switch.fari_armadio_interruttore_1": { room: "armadio", type: "switch" },

  // BAGNO
  "binary_sensor.movimento_bagno_occupazione": { room: "bagno", type: "motion" },
  "binary_sensor.movimento_porta_bagno_occupazione": { room: "bagno", type: "motion" },
  "switch.fari_bagno_interruttore_1": { room: "bagno", type: "switch" },
  "switch.luce_specchio_bagno": { room: "bagno", type: "switch" },

  // quando hai il nome reale del presence/lux bagno, sostituisci questi
  "binary_sensor.presenza_bagno": { room: "bagno", type: "presence" },
  "sensor.luminosita_bagno": { room: "bagno", type: "lux" },

  // TELEFONI
  "sensor.rea_nx9_wi_fi_connection": { type: "phone", person: "manu" },
  "sensor.valecph2305_wi_fi_connection": { type: "phone", person: "vale" },

  // METEO / SOLE
  "weather.forecast_home": { type: "weather" },
  "sun.sun": { type: "sun" },

  // CLIMA / TEMPERATURE — qui vanno messi i nomi reali quando me li dai
  "climate.clima_casa": { type: "climate" },
  "sensor.temperatura_casa": { type: "temperature" },
  "sensor.temperatura_cucina": { room: "cucina", type: "temperature" },
  "sensor.temperatura_salotto": { room: "salotto", type: "temperature" },
  "sensor.temperatura_bagno": { room: "bagno", type: "temperature" },
};

export function getEntityInfo(entityId: string): EntityInfo {
  return ENTITY_MAP[entityId] || { type: "other" };
}