var output = "";

fetchData();

var test = `"pitch_type","game_date","release_speed","release_pos_x","release_pos_z","player_name","batter","pitcher","events","description","spin_dir","spin_rate_deprecated","break_angle_deprecated","break_length_deprecated","zone","des","game_type","stand","p_throws","home_team","away_team","type","hit_location","bb_type","balls","strikes","game_year","pfx_x","pfx_z","plate_x","plate_z","on_3b","on_2b","on_1b","outs_when_up","inning","inning_topbot","hc_x","hc_y","tfs_deprecated","tfs_zulu_deprecated","fielder_2","umpire","sv_id","vx0","vy0","vz0","ax","ay","az","sz_top","sz_bot","hit_distance_sc","launch_speed","launch_angle","effective_speed","release_spin_rate","release_extension","game_pk","pitcher","fielder_2","fielder_3","fielder_4","fielder_5","fielder_6","fielder_7","fielder_8","fielder_9","release_pos_y","estimated_ba_using_speedangle","estimated_woba_using_speedangle","woba_value","woba_denom","babip_value","iso_value","launch_speed_angle","at_bat_number","pitch_number","pitch_name","home_score","away_score","bat_score","fld_score","post_away_score","post_home_score","post_bat_score","post_fld_score","if_fielding_alignment","of_fielding_alignment","spin_axis","delta_home_win_exp","delta_run_exp"`
test = test.split(",");
console.log(test.indexOf(`"game_date"`));

async function fetchData() {
    output = "";

    let batter = [];
    let batter_name = [];
    let des = [];
    let description = [];
    let game_pk = [];
    let hc_x = [];
    let hc_y = [];
    let hit_angle = [];
    let hit_distance = [];
    let hit_speed = [];
    let inning = [];
    let outs = [];
    let pitcher = [];
    let pitcher_name = [];
    let play_id = [];
    let team_home = [];
    let team_away = [];
    let date = [];

    Papa.parse(`2024raw.csv`, {
        download: true,
        complete: function (results) {
            data = results.data;

            for (let i = 1; i < data.length; i++) {
                batter.push(data[i][6]);
                batter_name.push(data[i][5].replace(",", ""));  
                description.push(data[i][8]);
                des.push(data[i][15]);
                game_pk.push(data[i][58]);
                hc_x.push(data[i][37]);
                hc_y.push(data[i][38]);
                hit_angle.push(data[i][54]);
                hit_distance.push(data[i][52]);
                hit_speed.push(data[i][53]);
                inning.push(data[i][35]);
                outs.push(data[i][34]);
                pitcher.push(data[i][7]);
                pitcher_name.push("Grinch");
                play_id.push("Unknown");
                team_home.push(data[i][19]);
                team_away.push(data[i][20]);
                date.push(data[i][1]);
            }

            for(let i = batter.length - 1; i >= 0; i --) {
                output += `${batter[i]}, ${batter_name[i]}, ${description[i]}, ${des[i]}, ${game_pk[i]}, ${hc_x[i]}, ${hc_y[i]}, ${hit_angle[i]}, ${hit_distance[i]}, ${hit_speed[i]}, ${inning[i]}, ${outs[i]}, ${pitcher[i]}, ${pitcher_name[i]}, ${play_id[i]}, ${team_home[i]}, ${team_away[i]}, ${date[i]}\n`;
            }
            console.log(output);
            document.getElementById("output").innerText = output;
        }
    });
}