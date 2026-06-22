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
    | "person"
    | "weather"
    | "sun"
    | "temperature"
    | "humidity"
    | "co2"
    | "noise"
    | "pressure"
    | "climate"
    | "fan"
    | "appliance"
    | "automation"
    | "contact"
    | "other";
  person?: "manu" | "vale";
};

const ENTITY_MAP: Record<string, EntityInfo> = {
  // PERSONE / POSIZIONE LOGICA HA
  "person.manuele": { type: "person", person: "manu" },
  "person.valentina": { type: "person", person: "vale" },

  // TELEFONI - PRESENZA CASA
  "sensor.rea_nx9_wi_fi_connection": { type: "phone", person: "manu" },
  "sensor.valecph2305_wi_fi_connection": { type: "phone", person: "vale" },

  // TELEFONI - DATI UTILI
  "sensor.rea_nx9_battery_level": { type: "phone", person: "manu" },
  "sensor.rea_nx9_battery_state": { type: "phone", person: "manu" },
  "sensor.rea_nx9_charger_type": { type: "phone", person: "manu" },
  "sensor.rea_nx9_last_update_trigger": { type: "phone", person: "manu" },
  "sensor.rea_nx9_network_type": { type: "phone", person: "manu" },
  "sensor.rea_nx9_do_not_disturb_sensor": { type: "phone", person: "manu" },

  "sensor.cph2305_battery_level": { type: "phone", person: "vale" },
  "sensor.cph2305_do_not_disturb_sensor": { type: "phone", person: "vale" },
  "sensor.cph2305_network_type": { type: "phone", person: "vale" },
  "sensor.cph2305_last_update_trigger": { type: "phone", person: "vale" },

  // SALOTTO
  "binary_sensor.movimento_sala_occupazione": { room: "salotto", type: "motion" },
  "binary_sensor.presenza_sala_occupazione": { room: "salotto", type: "presence" },
  "sensor.presenza_sala_illuminamento": { room: "salotto", type: "lux" },
  "light.lampadario_sala": { room: "salotto", type: "light" },
  "switch.lampada_salotto": { room: "salotto", type: "switch" },
  "media_player.lg_webos_tv_04e8": { room: "salotto", type: "tv" },

  // SCALE
  "binary_sensor.movimento_scale_occupazione": { room: "scale", type: "motion" },

  "light.striscia_led_scale": { room: "scale", type: "light" },

  // CUCINA
  "binary_sensor.movimento_cucina_occupazione": { room: "cucina", type: "motion" },
  "binary_sensor.smart_presence_sensor_occupazione": { room: "cucina", type: "presence" },
  "binary_sensor.echo_dot_valentina_movimento": { room: "cucina", type: "presence" },

  "sensor.smart_presence_sensor_illuminamento": { room: "cucina", type: "lux" },
  "sensor.echo_dot_valentina_illuminamento": { room: "cucina", type: "lux" },
  "sensor.echo_dot_valentina_temperatura": { room: "cucina", type: "temperature" },

  "switch.lampadario_cucina_switch_1": { room: "cucina", type: "switch" },
  "switch.luce_lavandino": { room: "cucina", type: "switch" },
  "light.led_cappa": { room: "cucina", type: "light" },
  "switch.presa_smart_cappa": { room: "cucina", type: "switch" },
  "fan.air_purifier_46": { room: "cucina", type: "fan" },

  "media_player.lg_webos_tv_uk6200pla": { room: "cucina", type: "tv" },
  "media_player.cucina": { room: "cucina", type: "other" },
  "media_player.cucina_echo_dot_valentina": { room: "cucina", type: "other" },

  // CAMERA
  "binary_sensor.movimento_camera_manu_occupazione": { room: "camera", type: "motion" },
  "binary_sensor.movimento_camera_vale_occupazione": { room: "camera", type: "motion" },
  "binary_sensor.movimento_camera_logica_1_2_persone": { room: "camera", type: "motion" },

  "light.lampadario_camera": { room: "camera", type: "light" },
  "light.lampada_manu": { room: "camera", type: "light" },
  "light.lampada_vale": { room: "camera", type: "light" },

  "media_player.hisense_43a5fe_dal10537_airplay": { room: "camera", type: "tv" },
  "media_player.valentina_s_vidaa_voice_tv": { room: "camera", type: "tv" },
  "media_player.vale_tv": { room: "camera", type: "tv" },

  "climate.camera": { room: "camera", type: "climate" },
  "sensor.camera_temperatura_ambiente": { room: "camera", type: "temperature" },
  "sensor.clima_camera_temperatura_esterna": { room: "camera", type: "temperature" },
  "sensor.camera_energia": { room: "camera", type: "other" },

  // ARMADIO
  "binary_sensor.movimento_armadio_occupazione": { room: "armadio", type: "motion" },
  "light.striscia_led_armadio": { room: "armadio", type: "light" },
  "switch.fari_armadio_interruttore_1": { room: "armadio", type: "switch" },

  // BAGNO
  "binary_sensor.movimento_bagno_occupazione": { room: "bagno", type: "motion" },
  "binary_sensor.movimento_porta_bagno_occupazione": { room: "bagno", type: "motion" },
  "binary_sensor.smart_presence_sensor_occupazione_2": { room: "bagno", type: "presence" },
  "sensor.smart_presence_sensor_illuminamento_2": { room: "bagno", type: "lux" },

  "switch.fari_bagno_interruttore_1": { room: "bagno", type: "switch" },
  "switch.luce_specchio_bagno": { room: "bagno", type: "switch" },

  // CASA / NETATMO
  "sensor.unknown_70_ee_50_83_7c_ac_temperatura": { type: "temperature" },
  "sensor.unknown_70_ee_50_83_7c_ac_umidita": { type: "humidity" },
  "sensor.unknown_70_ee_50_83_7c_ac_anidride_carbonica": { type: "co2" },
  "sensor.unknown_70_ee_50_83_7c_ac_noise": { type: "noise" },
  "sensor.unknown_70_ee_50_83_7c_ac_pressione_atmosferica": { type: "pressure" },

  "sensor.unknown_70_ee_50_83_7c_ac_esterno_temperatura": { type: "temperature" },
  "sensor.unknown_70_ee_50_83_7c_ac_esterno_umidita": { type: "humidity" },

  // METEO / SOLE
  "weather.forecast_home": { type: "weather" },
  "sun.sun": { type: "sun" },
  "sensor.palmanova_temperatura": { type: "temperature" },
  "sensor.palmanova_umidita": { type: "humidity" },
  "sensor.palmanova_precipitazione": { type: "weather" },
  "sensor.palmanova_precipitazioni_oggi": { type: "weather" },
  "sensor.palmanova_pressione_atmosferica": { type: "pressure" },

  // ELETTRODOMESTICI UTILI
  "sensor.lavastoviglie_stato_di_funzionamento": { room: "cucina", type: "appliance" },
  "sensor.lavastoviglie_porta": { room: "cucina", type: "appliance" },
  "sensor.lavastoviglie_orario_di_fine_del_programma": { room: "cucina", type: "appliance" },

  "binary_sensor.lavatrice_vale_status": { room: "bagno", type: "appliance" },
  "binary_sensor.lavatrice_vale_door_status": { room: "bagno", type: "appliance" },
  "sensor.lavatrice_vale_remaining_time": { room: "bagno", type: "appliance" },
  "sensor.lavatrice_vale_program_phase": { room: "bagno", type: "appliance" },

  // AUTOMAZIONI IMPORTANTI
  "automation.armadio_spegnimento_su_uscita_bagno_scale_con_controllo_presenza": {
    room: "armadio",
    type: "automation",
  },
  "automation.cucina_luce_con_presenza_luminosita_meross_v2": {
    room: "cucina",
    type: "automation",
  },
  "automation.cucina_movimento_accende_tv": {
    room: "cucina",
    type: "automation",
  },
  "automation.off_cucina_no_presenza": {
    room: "cucina",
    type: "automation",
  },
  "automation.on_lavandino": {
    room: "cucina",
    type: "automation",
  },
  "automation.salotto_follow_up_luce_10_min_senza_movimento": {
    room: "salotto",
    type: "automation",
  },
  "automation.camera_suggerimento_luce_5_min_senza_movimento_con_override_on": {
    room: "camera",
    type: "automation",
  },
  "automation.camera_suggerimento_luce_movimento_follow_up_10_min": {
    room: "camera",
    type: "automation",
  },
};

export function getEntityInfo(entityId: string): EntityInfo {
  const mapped = ENTITY_MAP[entityId];
  if (mapped) return mapped;

  const id = String(entityId || "").toLowerCase();
  if (
    id.startsWith("binary_sensor.") &&
    ["porta", "finestra", "door", "window", "contact"].some((term) => id.includes(term))
  ) {
    return { type: "contact" };
  }
  return { type: "other" };
}
