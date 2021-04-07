#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;

//ins for lambert
in vec4 fs_Nor; 
in vec4 fs_LightDir; 

out vec4 out_Col;

void main()
{

    float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightDir)); 
    float ambientTerm = 0.25; 
    float lightIntensity = diffuseTerm + ambientTerm; 

    out_Col = vec4(fs_Col.rgb * lightIntensity, fs_Col.a); 

    //out_Col = fs_Col;
}
