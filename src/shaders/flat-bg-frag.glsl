#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

uniform float u_SkyType; //sky type! 

in vec2 fs_Pos;
out vec4 out_Col;


const float TWO_PI = 6.28318530718;
const float PI = 3.14159265359;
vec2 sphereToUV(vec3 p) {

    float phi = atan(p.z, p.x);
    if (phi < 0.0) {
        phi += TWO_PI;
    }

    float theta = acos(p.y);

    return vec2(1.0 - phi / TWO_PI, 1.0 - theta / PI);
}

// sunset palette
const vec3 sunset[5] = vec3[](vec3(255, 229, 119) / 255.0, // yellow
                            vec3(254, 192, 81) / 255.0, // orange
                            vec3(255, 137, 103) / 255.0, // grapefruit
                            vec3(253, 96, 81) / 255.0, // rose pink
                            vec3(57, 32, 51) / 255.0); // dark purple

                            // dusk palette
const vec3 dusk[5] = vec3[](vec3(144, 96, 144) / 255.0, // light purple
                            vec3(96, 72, 120) / 255.0, // purple grape
                            vec3(72, 48, 120) / 255.0, // dark blue
                            vec3(48, 24, 96) / 255.0, // dark night
                            vec3(0, 24, 72) / 255.0); // dark cyan

// dusk palette
const vec3 noon[5] = vec3[] (vec3(204, 240, 255) / 255.0,
                            vec3(178, 232, 255) / 255.0,
                            vec3(153, 225, 255) / 255.0,
                            vec3(127, 218, 255) / 255.0,
                            vec3(102, 210, 255) / 255.0);

const vec3 sunrise[5] = vec3[](vec3(255,215,0) / 255.0,
                            vec3(255,165,0) / 255.0,
                            vec3(255,140,0) / 255.0,
                            vec3(255,127,80) / 255.0,
                            vec3(255,99,71) / 255.0);

const vec3 sunColor = vec3(255, 255, 190) / 255.0;
const vec3 cloudColor = sunset[3];

vec3 uvToSunrise(vec2 uv) {
    if (uv.y < 0.5) {
        return sunrise[0];
    } else if (uv.y < 0.55) {
        return mix(sunrise[0], sunrise[1], (uv.y - 0.5) / 0.05);
    } else if (uv.y < 0.6) {
        return mix(sunrise[1], sunrise[2], (uv.y - 0.55) / 0.05);
    } else if (uv.y < 0.65) {
        return mix(sunrise[2], sunrise[3], (uv.y - 0.6) / 0.05);
    } else if (uv.y < 0.75) {
        return mix(sunrise[3], sunrise[4], (uv.y - 0.65) / 0.1);
    }
    return sunrise[4];
}

vec3 uvToNoon(vec2 uv) {
    if (uv.y < 0.5) {
        return noon[0];
    } else if (uv.y < 0.55) {
        return mix(noon[0], noon[1], (uv.y - 0.5) / 0.05);
    } else if (uv.y < 0.6) {
        return mix(noon[1], noon[2], (uv.y - 0.55) / 0.05);
    } else if (uv.y < 0.65) {
        return mix(noon[2], noon[3], (uv.y - 0.6) / 0.05);
    } else if (uv.y < 0.75) {
        return mix(noon[3], noon[4], (uv.y - 0.65) / 0.1);
    }
    return noon[4];
}

// map uv to sunset palette
// assign colors based on y coordinate of uv
// interpolate between predefined intervals
vec3 uvToSunset(vec2 uv) {
    if (uv.y < 0.5) {
        return sunset[0];
    } else if (uv.y < 0.55) {
        return mix(sunset[0], sunset[1], (uv.y - 0.5) / 0.05);
    } else if (uv.y < 0.6) {
        return mix(sunset[1], sunset[2], (uv.y - 0.55) / 0.05);
    } else if (uv.y < 0.65) {
        return mix(sunset[2], sunset[3], (uv.y - 0.6) / 0.05);
    } else if (uv.y < 0.75) {
        return mix(sunset[3], sunset[4], (uv.y - 0.65) / 0.1);
    }
    return sunset[4];
}

// map uv to dusk palette
vec3 uvToDusk(vec2 uv) {
    if(uv.y < 0.5) {
        return dusk[0];
    }
    else if(uv.y < 0.55) {
        return mix(dusk[0], dusk[1], (uv.y - 0.5) / 0.05);
    }
    else if(uv.y < 0.6) {
        return mix(dusk[1], dusk[2], (uv.y - 0.55) / 0.05);
    }
    else if(uv.y < 0.65) {
        return mix(dusk[2], dusk[3], (uv.y - 0.6) / 0.05);
    }
    else if(uv.y < 0.75) {
        return mix(dusk[3], dusk[4], (uv.y - 0.65) / 0.1);
    }
    return dusk[4];
}


vec4 getMorningColor(vec3 rayDir) {
  vec2 uv = sphereToUV(rayDir); 

   // compute a gradient from the bottom of the sky-sphere to the top

    // uv is not noise, uv is perturbed by noise
    vec3 sunsetColor = uvToSunset(uv); //+ offset * 0.1);
    vec3 duskColor = uvToDusk(uv); //+ offset * 0.1);
    vec3 noonColor = uvToNoon(uv);
    vec3 sunriseColor = uvToSunrise(uv);

    //blue sky 
    vec3 outColor =  mix(noonColor, duskColor,  u_Dimensions.y - fs_Pos.y );

    if (u_SkyType == 1.) {
        //blue sky 
        outColor =  mix(noonColor, duskColor,  u_Dimensions.y - fs_Pos.y );
    } else if (u_SkyType == 2.) {
        //orange horizon 
        outColor =  mix(sunriseColor, duskColor,  u_Dimensions.y - fs_Pos.y );
    } else if (u_SkyType == 3.) {
        //magenta night 
        outColor =  mix(sunsetColor, noonColor * 0.15,  u_Dimensions.y + fs_Pos.y );
    }

    return vec4(outColor, 1.0); 


}

//raycasting function 
vec3 rayCast(vec3 eye) {

  vec3 forward = normalize(u_Ref - eye);
  vec3 right = normalize(cross(forward, u_Up));

  float FOVY = 45.0; 
  float angleTerm = tan(FOVY / 2.0);
  float aspectRatio = u_Dimensions.x / u_Dimensions.y; 
  vec3 V = (u_Up) * angleTerm;
  vec3 H = right * aspectRatio * angleTerm;
  vec3 point = forward + (fs_Pos.x * H) + (fs_Pos.y * V);

  return normalize(point);

}

void main() {
    vec2 uv = fs_Pos.xy / u_Dimensions.xy;
    uv.x -= 0.5; 
    uv.x *= u_Dimensions.x / u_Dimensions.y;  
    // sky
    vec3 color = mix(vec3(255.,212.,166.) / 255., vec3(204.,235.,255.) / 255., uv.y);


    out_Col = vec4(fs_Pos, fs_Pos.x, 1.0); 

    //trying other stuff

    vec3 rayDir = rayCast(u_Eye); 
     out_Col = getMorningColor(rayDir);
   // out_Col = vec4(0.5 * (fs_Pos + vec2(1.0)), 0.5 * (sin(u_Time * 3.14159 * 0.01) + 1.0), 1.0);

}
